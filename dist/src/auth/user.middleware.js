"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const winston_logger_1 = require("../common/winston.logger");
const COOKIE_NAME = 'auth_token';
let UserMiddleware = class UserMiddleware {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    use(req, res, next) {
        const token = req.cookies?.[COOKIE_NAME];
        if (!token) {
            winston_logger_1.winstonInstance.debug(`Anonymous request — no auth cookie`, { context: 'UserMiddleware' });
            return next();
        }
        try {
            const payload = this.jwtService.verify(token);
            req.user = {
                id: payload.sub,
                username: payload.username,
                role: payload.role,
                tenantId: payload.tenantId,
            };
            winston_logger_1.winstonInstance.debug(`JWT verified — req.user attached`, {
                context: 'UserMiddleware',
                userId: payload.sub,
                role: payload.role,
                tenantId: payload.tenantId,
            });
        }
        catch (err) {
            winston_logger_1.winstonInstance.warn(`JWT verification failed: ${err.message}`, { context: 'UserMiddleware' });
        }
        next();
    }
};
exports.UserMiddleware = UserMiddleware;
exports.UserMiddleware = UserMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], UserMiddleware);
//# sourceMappingURL=user.middleware.js.map