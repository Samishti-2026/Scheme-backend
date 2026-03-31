"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemesModule = void 0;
const common_1 = require("@nestjs/common");
const schemes_controller_1 = require("./schemes.controller");
const schemes_service_1 = require("./schemes.service");
const roles_guard_1 = require("../auth/roles.guard");
let SchemesModule = class SchemesModule {
};
exports.SchemesModule = SchemesModule;
exports.SchemesModule = SchemesModule = __decorate([
    (0, common_1.Module)({
        controllers: [schemes_controller_1.SchemesController],
        providers: [schemes_service_1.SchemesService, roles_guard_1.RolesGuard],
        exports: [schemes_service_1.SchemesService],
    })
], SchemesModule);
//# sourceMappingURL=schemes.module.js.map