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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const core_1 = require("@nestjs/core");
let DashboardController = class DashboardController {
    async getSummary() {
        return {
            quarterLabel: 'Q3 2024',
            changePercent: '+14.2%',
            totalSales: '₹42.5L',
            salesTarget: '₹50L',
            progressPercent: 85,
        };
    }
    async getUpcomingSchemes() {
        return [
            { id: 1, name: 'Summer Bonanza', startDate: '2024-06-01', target: '₹10M' },
            { id: 2, name: 'Q3 Growth Stimulus', startDate: '2024-07-15', target: '500+ Qty' },
        ];
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('upcoming-schemes'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getUpcomingSchemes", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard')
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map