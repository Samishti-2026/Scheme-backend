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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const core_1 = require("@nestjs/core");
let AnalyticsController = class AnalyticsController {
    async getKpis() {
        return {
            totalRevenue: '₹4.2M',
            revenueChange: '+12%',
            activeSchemes: 12,
            schemesChange: '+2',
            avgOrderValue: '₹35,200',
            avgOrderChange: '+5.4%',
        };
    }
    async getChart() {
        return [
            { name: 'Mon', value: 400 },
            { name: 'Tue', value: 300 },
            { name: 'Wed', value: 600 },
            { name: 'Thu', value: 800 },
            { name: 'Fri', value: 500 },
            { name: 'Sat', value: 900 },
            { name: 'Sun', value: 700 },
        ];
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('kpis'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getKpis", null);
__decorate([
    (0, common_1.Get)('chart'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getChart", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics')
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map