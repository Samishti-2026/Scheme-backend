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
exports.QueryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const filter_builder_1 = require("./utils/filter-builder");
const join_planner_1 = require("./utils/join-planner");
const operators_1 = require("./utils/operators");
const relations_1 = require("./utils/relations");
const winston_logger_1 = require("../common/winston.logger");
const CTX = 'QueryService';
let QueryService = class QueryService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    validateFilter(f) {
        if (!relations_1.ALLOWED_TABLES.includes(f.collection))
            throw new common_1.BadRequestException(`Invalid collection: ${f.collection}`);
        if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(f.field))
            throw new common_1.BadRequestException(`Invalid field name: ${f.field}`);
        const allowed = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith', 'endsWith', 'between', 'in'];
        if (!allowed.includes(f.operator))
            throw new common_1.BadRequestException(`Invalid operator: ${f.operator}`);
    }
    resolveRoot(filters) {
        const cols = [...new Set(filters.map(f => f.collection))];
        if (cols.includes('billing'))
            return 'billing';
        if (cols.length > 1)
            return 'billing';
        return cols[0] || 'billing';
    }
    resolveField(root, collection, field) {
        return collection === root ? field : `${collection}.${field}`;
    }
    async execute(filters = [], matchLogic = 'AND', aggregation = [], having = [], groupBy = []) {
        winston_logger_1.winstonInstance.info(`execute() called`, {
            context: CTX,
            filters: filters.length,
            matchLogic,
            aggregation: aggregation.length,
            groupBy: groupBy.length,
        });
        filters.forEach(f => {
            winston_logger_1.winstonInstance.debug(`Validating filter: ${f.collection}.${f.field} ${f.operator} "${f.value}"`, { context: CTX });
            this.validateFilter(f);
        });
        const root = this.resolveRoot(filters);
        winston_logger_1.winstonInstance.debug(`Root table: "${root}"`, { context: CTX });
        const joins = (0, join_planner_1.buildJoinPlan)(root, filters);
        winston_logger_1.winstonInstance.debug(`Joins: ${joins.map(j => `${j.type} ${j.table}`).join(', ') || '(none)'}`, { context: CTX });
        const matchFilters = filters.map(f => ({
            field: this.resolveField(root, f.collection, f.field),
            operator: f.operator,
            value: f.value,
            logic: f.logic,
        }));
        const { whereClause, params } = (0, filter_builder_1.buildMatch)(matchFilters, matchLogic);
        winston_logger_1.winstonInstance.debug(`WHERE: ${whereClause || '(none)'}`, { context: CTX, params });
        let selectClause = '*';
        if (aggregation.length > 0) {
            const parts = [];
            groupBy.forEach(g => parts.push(`${this.resolveField(root, g.collection, g.field)} AS ${g.field}`));
            aggregation.forEach(op => {
                const col = this.resolveField(root, op.collection, op.field);
                const alias = op.alias || `${op.operator}_${op.field}`;
                parts.push(op.operator === 'count' ? `COUNT(*) AS ${alias}` : `${op.operator.toUpperCase()}(${col}) AS ${alias}`);
            });
            selectClause = parts.join(', ');
        }
        const joinClause = joins.map(j => `${j.type} ${j.table} ON ${j.condition}`).join(' ');
        const groupByClause = groupBy.length > 0
            ? `GROUP BY ${groupBy.map(g => this.resolveField(root, g.collection, g.field)).join(', ')}`
            : '';
        let havingClause = '';
        if (having.length > 0) {
            const havingParts = having.map(h => {
                const op = operators_1.OPERATORS[h.operator](h.value);
                params.push(op.value);
                return `${h.field} ${op.operator} $${params.length}`;
            });
            havingClause = `HAVING ${havingParts.join(' AND ')}`;
        }
        const sql = [
            `SELECT ${selectClause}`,
            `FROM ${root}`,
            joinClause,
            whereClause,
            groupByClause,
            havingClause,
            'LIMIT 1000',
        ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
        winston_logger_1.winstonInstance.info(`Executing SQL`, { context: CTX, sql, db: this.dataSource.options.database });
        const rows = await this.dataSource.query(sql, params);
        winston_logger_1.winstonInstance.info(`Query returned ${rows.length} row(s)`, { context: CTX });
        return aggregation.length > 0
            ? { type: 'aggregation', query: sql, aggregation_data: rows, aggregation_count: rows.length }
            : { type: 'regular', query: sql, data: rows, count: rows.length };
    }
    async getFieldValues(collection, field) {
        winston_logger_1.winstonInstance.debug(`getFieldValues("${collection}", "${field}")`, { context: CTX });
        if (!relations_1.ALLOWED_TABLES.includes(collection))
            throw new common_1.BadRequestException(`Invalid collection: ${collection}`);
        if (/[$;'"\\]/.test(field))
            throw new common_1.BadRequestException(`Invalid field: ${field}`);
        const rows = await this.dataSource.query(`SELECT DISTINCT "${field}"::text as val FROM "${collection}" WHERE "${field}" IS NOT NULL ORDER BY val LIMIT 200`);
        winston_logger_1.winstonInstance.debug(`getFieldValues returned ${rows.length} value(s)`, { context: CTX });
        return rows.map((r) => r.val);
    }
};
exports.QueryService = QueryService;
exports.QueryService = QueryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TENANT_CONNECTION')),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], QueryService);
//# sourceMappingURL=query.service.js.map