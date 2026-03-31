"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const winston_logger_1 = require("../common/winston.logger");
const tenants_service_1 = require("../tenants/tenants.service");
const tenants_connection_service_1 = require("../database/tenants-connection.service");
const CTX = 'AuthController';
const COOKIE_NAME = 'auth_token';
const IS_PROD = process.env.NODE_ENV === 'production';
let AuthController = class AuthController {
    jwtService;
    tenantsService;
    tenantsConnectionService;
    constructor(jwtService, tenantsService, tenantsConnectionService) {
        this.jwtService = jwtService;
        this.tenantsService = tenantsService;
        this.tenantsConnectionService = tenantsConnectionService;
    }
    async resolveTenant(body) {
        const slug = body.slug?.trim().toLowerCase();
        if (!slug)
            throw new common_1.BadRequestException('slug is required');
        const tenant = await this.tenantsService.findBySlug(slug);
        if (!tenant) {
            throw new common_1.NotFoundException(`No company found with slug "${slug}"`);
        }
        winston_logger_1.winstonInstance.info(`Tenant resolved by slug`, { context: CTX, slug, tenantId: tenant.id });
        return {
            id: tenant.id,
            name: tenant.name,
            code: tenant.slug,
            color: '#06b6d4',
            isActive: true,
        };
    }
    async login(body, res) {
        const { username, password } = body;
        winston_logger_1.winstonInstance.info(`POST /auth/login attempt`, { context: CTX, username });
        if (!username || !password) {
            throw new common_1.BadRequestException('Username and password are required');
        }
        const tenantId = body.tenantId;
        if (!tenantId) {
            throw new common_1.BadRequestException('tenantId is required');
        }
        const tenant = await this.tenantsService.findOne(tenantId);
        if (!tenant) {
            throw new common_1.UnauthorizedException('Invalid tenant');
        }
        const dataSource = await this.tenantsConnectionService.getTenantConnection(String(tenantId), tenant.connectionUri);
        const ALLOWED_ID_COLS = ['id', 'user_id'];
        const ALLOWED_PWD_COLS = ['password', 'password_hash'];
        const schemaCheck = await dataSource.query(`SELECT column_name FROM information_schema.columns
       WHERE table_name = 'users' AND column_name IN ('id','user_id','password','password_hash')`);
        const colNames = schemaCheck.map((r) => r.column_name);
        const idCol = ALLOWED_ID_COLS.find(c => colNames.includes(c)) ?? 'id';
        const pwdCol = ALLOWED_PWD_COLS.find(c => colNames.includes(c)) ?? 'password';
        const result = await dataSource.query(`SELECT ${idCol} as id, username, ${pwdCol} as password, role FROM users WHERE username = $1`, [username]);
        const user = result[0];
        if (!user) {
            winston_logger_1.winstonInstance.warn(`Login failed — user not found`, { context: CTX, username });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isHashed = user.password?.startsWith('$2');
        const passwordValid = isHashed
            ? await bcrypt.compare(password, user.password)
            : user.password === password;
        if (!passwordValid) {
            winston_logger_1.winstonInstance.warn(`Login failed — wrong password`, { context: CTX, username });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            tenantId,
        };
        const token = this.jwtService.sign(payload);
        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: IS_PROD,
            sameSite: IS_PROD ? 'strict' : 'lax',
            maxAge: 8 * 60 * 60 * 1000,
        });
        winston_logger_1.winstonInstance.info(`Login success — JWT issued`, { context: CTX, username, role: user.role, tenantId });
        return {
            user: {
                id: user.id,
                username: user.username,
                displayName: user.username,
                role: user.role,
                tenantId,
            },
        };
    }
    logout(res) {
        res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: IS_PROD, sameSite: IS_PROD ? 'strict' : 'lax' });
        winston_logger_1.winstonInstance.info(`Logout — cookie cleared`, { context: CTX });
        return { message: 'Logged out' };
    }
    me(req) {
        const user = req.user;
        if (!user)
            throw new common_1.UnauthorizedException('Not authenticated');
        return {
            user: {
                id: user.id,
                username: user.username,
                displayName: user.username,
                role: user.role,
                tenantId: user.tenantId,
            },
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('resolve-tenant'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resolveTenant", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('me'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        tenants_service_1.TenantsService,
        tenants_connection_service_1.TenantsConnectionService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map