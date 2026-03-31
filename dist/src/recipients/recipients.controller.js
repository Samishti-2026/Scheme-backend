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
exports.RecipientsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const core_1 = require("@nestjs/core");
const TABLE_ALIAS = {
    customer: 'c',
    billing: 'b',
    payment: 'p',
};
function buildCondition(alias, field, operator, value, paramIdx) {
    const col = `${alias}.${field}`;
    const p = '$';
    const normalizeDate = (v) => {
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v))
            return v.split('T')[0];
        return v;
    };
    const isDateValue = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v);
    const normalizedValue = normalizeDate(value);
    const colExpr = isDateValue(normalizedValue) ? `${col}::date` : col;
    switch (operator) {
        case 'eq': return { sql: `${colExpr} = ${p}${paramIdx}`, params: [normalizedValue] };
        case 'ne': return { sql: `${colExpr} != ${p}${paramIdx}`, params: [normalizedValue] };
        case 'gt': return { sql: `${colExpr} > ${p}${paramIdx}`, params: [normalizedValue] };
        case 'gte': return { sql: `${colExpr} >= ${p}${paramIdx}`, params: [normalizedValue] };
        case 'lt': return { sql: `${colExpr} < ${p}${paramIdx}`, params: [normalizedValue] };
        case 'lte': return { sql: `${colExpr} <= ${p}${paramIdx}`, params: [normalizedValue] };
        case 'contains': return { sql: `${col} ILIKE ${p}${paramIdx}`, params: [`%${normalizedValue}%`] };
        case 'startsWith': return { sql: `${col} ILIKE ${p}${paramIdx}`, params: [`${normalizedValue}%`] };
        case 'endsWith': return { sql: `${col} ILIKE ${p}${paramIdx}`, params: [`%${normalizedValue}`] };
        case 'in': {
            const rawVals = Array.isArray(value)
                ? value
                : String(value).split(',').map((v) => v.trim()).filter(Boolean);
            const vals = rawVals.map(normalizeDate);
            const useDate = vals.some(isDateValue);
            const castCol = useDate ? `${col}::date` : col;
            const placeholders = vals.map((_, i) => `${p}${paramIdx + i}`).join(', ');
            return { sql: `${castCol} IN (${placeholders})`, params: vals };
        }
        default: return { sql: `${colExpr} = ${p}${paramIdx}`, params: [normalizedValue] };
    }
}
let RecipientsController = class RecipientsController {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async queryCustomers(filters = []) {
        const allParams = [];
        const whereConds = [];
        let pIdx = 1;
        for (const f of filters) {
            const alias = TABLE_ALIAS[f.collection] ?? f.collection;
            const { sql, params: p } = buildCondition(alias, f.field, f.operator, f.value, pIdx);
            whereConds.push(sql);
            allParams.push(...p);
            pIdx += p.length;
        }
        const whereClause = whereConds.length > 0 ? `WHERE ${whereConds.join(' AND ')}` : '';
        const sql = `
      SELECT
        c.customer_code                                   AS id,
        COALESCE(NULLIF(c.customer_name, ''), 'Customer ' || c.customer_code::text) AS name,
        c.region,
        c.customer_group,
        c.country,
        c.sales_district,
        COALESCE(SUM(b.invoiced_qty), 0)                  AS qty_till_date,
        COALESCE(
          SUM(b.invoiced_qty) /
          NULLIF(DATE_PART('day', MAX(b.billing_date)::timestamp - MIN(b.billing_date)::timestamp), 0),
          0
        )                                                 AS avg_daily_qty,
        COALESCE(SUM(b.net_value), 0)                     AS net_value,
        COALESCE(SUM(p.amount), 0)                        AS total_amount,
        MAX(b.billing_date)                               AS inv_date,
        MAX(p.posting_date)                               AS pay_date
      FROM customer c
      LEFT JOIN billing b ON b.payer = c.customer_code
      LEFT JOIN payment p ON p.customer_number = c.customer_code
      ${whereClause}
      GROUP BY c.customer_code, c.customer_name, c.region, c.customer_group, c.country, c.sales_district
      ORDER BY qty_till_date DESC
    `;
        const rows = await this.dataSource.query(sql, allParams);
        return rows.map((r) => ({
            ...r,
            currentTO: Number(r.qty_till_date),
            avgDaily: Number(r.avg_daily_qty),
            invoiceDate: r.inv_date,
            paymentDate: r.pay_date,
        }));
    }
    async findAll(recipientType) {
        if (recipientType === 'customer') {
            const rows = await this.queryCustomers();
            console.log('[Recipients] rows returned:', rows.length);
            return rows;
        }
        return [];
    }
    async queryWithFilters(body) {
        const { recipientType = 'customer', filters = [] } = body;
        if (recipientType === 'customer') {
            const rows = await this.queryCustomers(filters);
            console.log('[Recipients/query] filters:', filters.length, '→ rows:', rows.length);
            return rows;
        }
        return [];
    }
    async getFilterOptions() {
        return [
            { name: 'Customer', options: ['customer_name', 'country', 'region', 'customer_group'] },
        ];
    }
    getRecipientTypes() {
        return [
            { key: 'customer', label: 'Customer' },
            { key: 'distributor', label: 'Distributor' },
            { key: 'sales_executive', label: 'Sales Executive' },
        ];
    }
};
exports.RecipientsController = RecipientsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __param(0, (0, common_1.Query)('recipientType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecipientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('query'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecipientsController.prototype, "queryWithFilters", null);
__decorate([
    (0, common_1.Get)('filter-options'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecipientsController.prototype, "getFilterOptions", null);
__decorate([
    (0, common_1.Get)('types'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    (0, common_1.UseGuards)(new roles_guard_1.RolesGuard(new core_1.Reflector())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RecipientsController.prototype, "getRecipientTypes", null);
exports.RecipientsController = RecipientsController = __decorate([
    (0, common_1.Controller)('recipients'),
    __param(0, (0, common_1.Inject)('TENANT_CONNECTION')),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], RecipientsController);
//# sourceMappingURL=recipients.controller.js.map