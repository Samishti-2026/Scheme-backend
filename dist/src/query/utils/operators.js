"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATORS = void 0;
function maybeNumber(v) {
    if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)))
        return Number(v);
    return v;
}
function maybeDate(v) {
    if (typeof v === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(v))
            return v;
        const dmy = v.match(/^([0-9]{2})[-/]([0-9]{2})[-/](\d{4})/);
        if (dmy)
            return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    }
    return v;
}
function coerce(v) {
    return maybeDate(maybeNumber(v));
}
exports.OPERATORS = {
    eq: v => ({ operator: '=', value: coerce(v) }),
    ne: v => ({ operator: '!=', value: coerce(v) }),
    gt: v => ({ operator: '>', value: coerce(v) }),
    gte: v => ({ operator: '>=', value: coerce(v) }),
    lt: v => ({ operator: '<', value: coerce(v) }),
    lte: v => ({ operator: '<=', value: coerce(v) }),
    contains: v => ({ operator: 'ILIKE', value: `%${coerce(v)}%` }),
    startsWith: v => ({ operator: 'ILIKE', value: `${coerce(v)}%` }),
    endsWith: v => ({ operator: 'ILIKE', value: `%${coerce(v)}` }),
    in: v => ({ operator: 'IN', value: Array.isArray(v) ? v.map(coerce) : [coerce(v)] }),
    between: v => ({ operator: 'BETWEEN', value: [coerce(v.from), coerce(v.to)] }),
};
//# sourceMappingURL=operators.js.map