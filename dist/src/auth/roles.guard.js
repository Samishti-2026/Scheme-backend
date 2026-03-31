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
exports.RolesGuard = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const winston_logger_1 = require("../common/winston.logger");
exports.ROLES_KEY = 'roles';
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.get(exports.ROLES_KEY, context.getHandler());
        if (!requiredRoles) {
            winston_logger_1.winstonInstance.debug(`No @Roles() on handler — open access`, { context: 'RolesGuard' });
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const path = `${request.method} ${request.path}`;
        winston_logger_1.winstonInstance.debug(`Checking roles for "${path}"`, {
            context: 'RolesGuard',
            requiredRoles,
            user: user ?? null,
        });
        if (!user) {
            winston_logger_1.winstonInstance.warn(`DENIED — no user on request for ${path}`, { context: 'RolesGuard' });
            throw new common_1.UnauthorizedException('Not authenticated');
        }
        if (!requiredRoles.includes(user.role)) {
            winston_logger_1.winstonInstance.warn(`DENIED — role "${user.role}" not in [${requiredRoles.join(', ')}]`, {
                context: 'RolesGuard', path, userId: user.id,
            });
            throw new common_1.ForbiddenException(`Role '${user.role}' is not allowed to perform this action`);
        }
        winston_logger_1.winstonInstance.debug(`ALLOWED — role "${user.role}" passed for ${path}`, { context: 'RolesGuard' });
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map