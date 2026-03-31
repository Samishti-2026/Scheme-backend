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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const core_1 = require("@nestjs/core");
const DEFAULT_SETTINGS = {
    displayName: '',
    email: '',
    emailAlerts: true,
    weeklyReports: true,
    systemUpdates: true,
};
let SettingsController = class SettingsController {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getSettings() {
        if (!this.dataSource)
            return DEFAULT_SETTINGS;
        try {
            const rows = await this.dataSource.query(`SELECT value FROM app_settings WHERE key = 'user_settings' LIMIT 1`);
            if (rows.length > 0)
                return JSON.parse(rows[0].value);
        }
        catch {
        }
        return DEFAULT_SETTINGS;
    }
    async updateSettings(data) {
        if (!this.dataSource)
            return { ...DEFAULT_SETTINGS, ...data };
        try {
            await this.dataSource.query(`INSERT INTO app_settings (key, value)
         VALUES ('user_settings', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [JSON.stringify({ ...DEFAULT_SETTINGS, ...data })]);
        }
        catch {
        }
        return { ...DEFAULT_SETTINGS, ...data };
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)(),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateSettings", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('settings'),
    __param(0, (0, common_1.Inject)('TENANT_CONNECTION')),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map