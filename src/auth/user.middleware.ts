import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { winstonInstance as logger } from '../common/winston.logger';

const COOKIE_NAME = 'auth_token';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      logger.debug(`Anonymous request — no auth cookie`, { context: 'UserMiddleware' });
      return next();
    }

    try {
      const payload = this.jwtService.verify(token) as {
        sub: number;
        username: string;
        role: string;
        tenantId: number | null;
      };

      (req as any).user = {
        id:       payload.sub,
        username: payload.username,
        role:     payload.role,
        tenantId: payload.tenantId,
      };

      logger.debug(`JWT verified — req.user attached`, {
        context:  'UserMiddleware',
        userId:   payload.sub,
        role:     payload.role,
        tenantId: payload.tenantId,
      });
    } catch (err: any) {
      // Token expired or tampered — treat as anonymous, let guards reject if needed
      logger.warn(`JWT verification failed: ${err.message}`, { context: 'UserMiddleware' });
    }

    next();
  }
}
