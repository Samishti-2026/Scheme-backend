"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMatch = buildMatch;
const operators_1 = require("./operators");
const winston_logger_1 = require("../../common/winston.logger");
const CTX = 'FilterBuilder';
function buildMatch(filters, matchLogic = 'AND') {
    if (!filters || filters.length === 0) {
        winston_logger_1.winstonInstance.debug(`No filters — skipping WHERE clause`, { context: CTX });
        return { whereClause: '', params: [] };
    }
    winston_logger_1.winstonInstance.debug(`Building WHERE for ${filters.length} filter(s), logic="${matchLogic}"`, { context: CTX });
    const params = [];
    let paramIndex = 1;
    const conditions = [];
    for (const f of filters) {
        if (!operators_1.OPERATORS[f.operator])
            throw new Error(`Invalid operator: ${f.operator}`);
        const op = operators_1.OPERATORS[f.operator](f.value);
        if (f.operator === 'in') {
            const values = Array.isArray(op.value) ? op.value : [op.value];
            const placeholders = values.map(() => `$${paramIndex++}`).join(', ');
            const cond = `${f.field} ${op.operator} (${placeholders})`;
            conditions.push(cond);
            params.push(...values);
            winston_logger_1.winstonInstance.debug(`  IN → ${cond}`, { context: CTX, values });
        }
        else if (f.operator === 'between') {
            const cond = `${f.field} ${op.operator} $${paramIndex} AND $${paramIndex + 1}`;
            conditions.push(cond);
            params.push(...op.value);
            paramIndex += 2;
            winston_logger_1.winstonInstance.debug(`  BETWEEN → ${cond}`, { context: CTX, values: op.value });
        }
        else {
            const cond = `${f.field} ${op.operator} $${paramIndex++}`;
            conditions.push(cond);
            params.push(op.value);
            winston_logger_1.winstonInstance.debug(`  ${f.operator} → ${cond} = "${op.value}"`, { context: CTX });
        }
    }
    if (conditions.length === 0)
        return { whereClause: '', params: [] };
    const hasMixed = filters.some(f => f.logic);
    let whereClause;
    if (!hasMixed) {
        const sep = matchLogic === 'OR' ? ' OR ' : ' AND ';
        whereClause = `WHERE ${conditions.join(sep)}`;
    }
    else {
        let clause = conditions[0];
        for (let i = 1; i < conditions.length; i++) {
            const logic = filters[i].logic || matchLogic;
            clause = `(${clause}) ${logic} ${conditions[i]}`;
        }
        whereClause = `WHERE ${clause}`;
    }
    winston_logger_1.winstonInstance.debug(`WHERE clause built: ${whereClause}`, { context: CTX });
    return { whereClause, params };
}
//# sourceMappingURL=filter-builder.js.map