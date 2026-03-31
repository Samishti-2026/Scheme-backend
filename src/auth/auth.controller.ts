import {
  Controller, Post, Body, Res, Req,
  UnauthorizedException, BadRequestException, NotFoundException, HttpCode,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { winstonInstance as logger } from '../common/winston.logger';
import { TenantsService } from '../tenants/tenants.service';
import { TenantsConnectionService } from '../database/tenants-connection.service';

const CTX = 'AuthController';
const COOKIE_NAME = 'auth_token';
const IS_PROD = process.env.NODE_ENV === 'production';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantsService: TenantsService,
    private readonly tenantsConnectionService: TenantsConnectionService,
  ) {}

  /**
   * Resolves a company slug to safe tenant info (id, name, color).
   * No auth required — used on the login page before credentials are entered.
   * Never exposes dbName, connection_uri, or any sensitive fields.
   */
  @Post('resolve-tenant')
  @HttpCode(200)
  async resolveTenant(@Body() body: { slug?: string }) {
    const slug = body.slug?.trim().toLowerCase();
    if (!slug) throw new BadRequestException('slug is required');

    const tenant = await this.tenantsService.findBySlug(slug);
    if (!tenant) {
      throw new NotFoundException(`No company found with slug "${slug}"`);
    }

    logger.info(`Tenant resolved by slug`, { context: CTX, slug, tenantId: tenant.id });

    // Return only what the login page needs — nothing sensitive
    return {
      id:       tenant.id,
      name:     tenant.name,
      code:     tenant.slug,  // frontend TenantData uses 'code'
      color:    '#06b6d4',
      isActive: true,
    };
  }

  @Post('login')
  async login(
    @Body() body: { username?: string; password?: string; tenantId?: number },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { username, password } = body;

    logger.info(`POST /auth/login attempt`, { context: CTX, username });

    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const tenantId = body.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    // Resolve tenant from common DB and open its connection directly
    const tenant = await this.tenantsService.findOne(tenantId);
    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    const dataSource = await this.tenantsConnectionService.getTenantConnection(
      String(tenantId),
      tenant.connectionUri,
    );

    // Auto-detect schema columns — whitelisted, never from user input
    const ALLOWED_ID_COLS  = ['id', 'user_id'];
    const ALLOWED_PWD_COLS = ['password', 'password_hash'];

    const schemaCheck = await dataSource.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'users' AND column_name IN ('id','user_id','password','password_hash')`,
    );
    const colNames: string[] = schemaCheck.map((r: any) => r.column_name);
    const idCol  = ALLOWED_ID_COLS.find(c => colNames.includes(c))  ?? 'id';
    const pwdCol = ALLOWED_PWD_COLS.find(c => colNames.includes(c)) ?? 'password';

    const result = await dataSource.query(
      `SELECT ${idCol} as id, username, ${pwdCol} as password, role FROM users WHERE username = $1`,
      [username],
    );

    const user = result[0];
    if (!user) {
      logger.warn(`Login failed — user not found`, { context: CTX, username });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isHashed = user.password?.startsWith('$2');
    const passwordValid = isHashed
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!passwordValid) {
      logger.warn(`Login failed — wrong password`, { context: CTX, username });
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub:      user.id,
      username: user.username,
      role:     user.role,
      tenantId,
    };

    const token = this.jwtService.sign(payload);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   IS_PROD,
      sameSite: IS_PROD ? 'none' : 'lax',  // 'none' required for cross-domain cookies
      maxAge:   8 * 60 * 60 * 1000,
    });

    logger.info(`Login success — JWT issued`, { context: CTX, username, role: user.role, tenantId });

    return {
      user: {
        id:          user.id,
        username:    user.username,
        displayName: user.username,
        role:        user.role,
        tenantId,
      },
    };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: IS_PROD, sameSite: IS_PROD ? 'none' : 'lax' });
    logger.info(`Logout — cookie cleared`, { context: CTX });
    return { message: 'Logged out' };
  }

  /** Returns the current user from the JWT — useful for session restore on page refresh */
  @Post('me')
  @HttpCode(200)
  me(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new UnauthorizedException('Not authenticated');
    return {
      user: {
        id:          user.id,
        username:    user.username,
        displayName: user.username, // JWT stores username; map to displayName for frontend
        role:        user.role,
        tenantId:    user.tenantId,
      },
    };
  }
}
