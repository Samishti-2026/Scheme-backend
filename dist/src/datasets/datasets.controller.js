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
exports.DatasetsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const customer_entity_1 = require("../common/entities/customer.entity");
const material_entity_1 = require("../common/entities/material.entity");
const billing_entity_1 = require("../common/entities/billing.entity");
const payment_entity_1 = require("../common/entities/payment.entity");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const core_1 = require("@nestjs/core");
let DatasetsController = class DatasetsController {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getDatasets() {
        if (!this.dataSource) {
            return { database: 'none', datasets: [] };
        }
        const entities = [
            { name: 'customer', entity: customer_entity_1.Customer },
            { name: 'material', entity: material_entity_1.Material },
            { name: 'billing', entity: billing_entity_1.Billing },
            { name: 'payment', entity: payment_entity_1.Payment },
        ];
        const fieldsData = entities.map(({ name, entity }) => {
            const metadata = this.dataSource.getMetadata(entity);
            const fields = metadata.columns.map(column => {
                let type = 'string';
                const columnType = column.type?.toString().toLowerCase();
                if (['numeric', 'integer', 'int4', 'decimal', 'float'].some(t => columnType?.includes(t))) {
                    type = 'number';
                }
                else if (['timestamp', 'date'].some(t => columnType?.includes(t))) {
                    type = 'date';
                }
                return {
                    name: column.propertyName,
                    type: type,
                };
            });
            return {
                name,
                fields,
            };
        });
        return {
            database: this.dataSource.options.database,
            datasets: fieldsData,
        };
    }
    async getFilterValues(table, column) {
        if (!this.dataSource || !table || !column)
            return [];
        const allowedTables = ['customer', 'material', 'billing', 'payment'];
        const safeTable = table.toLowerCase();
        if (!allowedTables.includes(safeTable))
            return [];
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column))
            return [];
        const entityMap = {
            customer: customer_entity_1.Customer, material: material_entity_1.Material, billing: billing_entity_1.Billing, payment: payment_entity_1.Payment,
        };
        const metadata = this.dataSource.getMetadata(entityMap[safeTable]);
        const validColumns = metadata.columns.map(c => c.databaseName);
        if (!validColumns.includes(column))
            return [];
        try {
            const results = await this.dataSource.query(`SELECT DISTINCT "${column}" as val FROM "${safeTable}" WHERE "${column}" IS NOT NULL ORDER BY val LIMIT 100`);
            return results.map((r) => {
                const val = r.val;
                if (val instanceof Date)
                    return val.toISOString().split('T')[0];
                if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val))
                    return val.split('T')[0];
                return val;
            });
        }
        catch (error) {
            console.error(`Error fetching filter values for ${safeTable}.${column}:`, error);
            return [];
        }
    }
};
exports.DatasetsController = DatasetsController;
__decorate([
    (0, common_1.Get)('datasets'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatasetsController.prototype, "getDatasets", null);
__decorate([
    (0, common_1.Get)('filter-values'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __param(0, (0, common_1.Query)('table')),
    __param(1, (0, common_1.Query)('column')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DatasetsController.prototype, "getFilterValues", null);
exports.DatasetsController = DatasetsController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, common_1.Inject)('TENANT_CONNECTION')),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DatasetsController);
//# sourceMappingURL=datasets.controller.js.map