import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { TenantsService } from '../tenants/tenants.service';
import { TenantsConnectionService } from '../database/tenants-connection.service';
export declare class AuthController {
    private readonly jwtService;
    private readonly tenantsService;
    private readonly tenantsConnectionService;
    constructor(jwtService: JwtService, tenantsService: TenantsService, tenantsConnectionService: TenantsConnectionService);
    resolveTenant(body: {
        slug?: string;
    }): Promise<{
        id: number;
        name: string;
        code: string;
        color: string;
        isActive: boolean;
    }>;
    login(body: {
        username?: string;
        password?: string;
        tenantId?: number;
    }, res: Response): Promise<{
        user: {
            id: any;
            username: any;
            displayName: any;
            role: any;
            tenantId: number;
        };
    }>;
    logout(res: Response): {
        message: string;
    };
    me(req: Request): {
        user: {
            id: any;
            username: any;
            displayName: any;
            role: any;
            tenantId: any;
        };
    };
}
