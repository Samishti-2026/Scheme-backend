"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildJoinPlan = buildJoinPlan;
const relations_1 = require("./relations");
const path_resolver_1 = require("./path-resolver");
const winston_logger_1 = require("../../common/winston.logger");
const CTX = 'JoinPlanner';
function dedupe(arr, keyFn) {
    const seen = new Set();
    return arr.filter(i => {
        const k = keyFn(i);
        if (seen.has(k))
            return false;
        seen.add(k);
        return true;
    });
}
function buildJoinPlan(root, filters) {
    const joins = [];
    const collections = [...new Set(filters.map(f => f.collection))];
    winston_logger_1.winstonInstance.debug(`buildJoinPlan root="${root}"`, { context: CTX, collections });
    for (const f of filters) {
        if (f.collection === root) {
            winston_logger_1.winstonInstance.debug(`  "${f.collection}" == root — no join needed`, { context: CTX });
            continue;
        }
        const path = (0, path_resolver_1.findPath)(root, f.collection);
        winston_logger_1.winstonInstance.debug(`  Path ${root} → ${f.collection}: ${path ? path.join(' → ') : 'NOT FOUND'}`, { context: CTX });
        if (!path)
            continue;
        for (let i = 0; i < path.length - 1; i++) {
            const a = path[i];
            const b = path[i + 1];
            const rel = relations_1.RELATIONS.find(r => (r.from === a && r.to === b) || (r.from === b && r.to === a));
            if (!rel) {
                winston_logger_1.winstonInstance.warn(`No relation between "${a}" and "${b}"`, { context: CTX });
                continue;
            }
            const leftCol = rel.from === a ? rel.local : rel.foreign;
            const rightCol = rel.from === a ? rel.foreign : rel.local;
            const condition = `${a}.${leftCol} = ${b}.${rightCol}`;
            joins.push({ type: 'LEFT JOIN', table: b, condition });
            winston_logger_1.winstonInstance.debug(`  + LEFT JOIN ${b} ON ${condition}`, { context: CTX });
        }
    }
    const deduped = dedupe(joins, j => `${j.table}:${j.condition}`);
    winston_logger_1.winstonInstance.debug(`Final joins (${deduped.length}): ${deduped.map(j => j.table).join(', ') || '(none)'}`, { context: CTX });
    return deduped;
}
//# sourceMappingURL=join-planner.js.map