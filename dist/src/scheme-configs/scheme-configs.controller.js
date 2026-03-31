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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemeConfigsController = void 0;
const common_1 = require("@nestjs/common");
const scheme_configs_service_1 = require("./scheme-configs.service");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const core_1 = require("@nestjs/core");
let SchemeConfigsController = class SchemeConfigsController {
    schemeConfigsService;
    constructor(schemeConfigsService) {
        this.schemeConfigsService = schemeConfigsService;
    }
    async findAll(name) {
        if (name) {
            const result = await this.schemeConfigsService.findByName(name);
            if (!result)
                throw new common_1.NotFoundException(`Config '${name}' not found`);
            return result;
        }
        return this.schemeConfigsService.findAll();
    }
    findAllConfigs() {
        return this.schemeConfigsService.findAll();
    }
    create(body, req) {
        const actor = req.user?.id ? String(req.user.id) : undefined;
        return this.schemeConfigsService.createConfig(body.name || 'default', body.config, actor);
    }
    update(id, data, req) {
        const actor = req.user?.id ? String(req.user.id) : undefined;
        return this.schemeConfigsService.update(+id, data, actor);
    }
    remove(id) {
        return this.schemeConfigsService.remove(+id);
    }
};
exports.SchemeConfigsController = SchemeConfigsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchemeConfigsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchemeConfigsController.prototype, "findAllConfigs", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SchemeConfigsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SchemeConfigsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchemeConfigsController.prototype, "remove", null);
exports.SchemeConfigsController = SchemeConfigsController = __decorate([
    (0, swagger_1.ApiTags)('scheme-configs'),
    (0, swagger_1.ApiHeader)({ name: 'x-tenant-id', required: true }),
    (0, common_1.Controller)('scheme-config'),
    __metadata("design:paramtypes", [scheme_configs_service_1.SchemeConfigsService])
], SchemeConfigsController);
//# sourceMappingURL=scheme-configs.controller.js.map