import { OPERATORS } from './operators';
import { winstonInstance as logger } from '../../common/winston.logger';

const CTX = 'FilterBuilder';

export interface FilterDef {
  field: string;
  operator: string;
  value: any;
  logic?: 'AND' | 'OR';
}

export function buildMatch(
  filters: FilterDef[],
  matchLogic: 'AND' | 'OR' = 'AND',
): { whereClause: string; params: any[] } {
  if (!filters || filters.length === 0) {
    logger.debug(`No filters — skipping WHERE clause`, { context: CTX });
    return { whereClause: '', params: [] };
  }

  logger.debug(`Building WHERE for ${filters.length} filter(s), logic="${matchLogic}"`, { context: CTX });

  const params: any[] = [];
  let paramIndex = 1;
  const conditions: string[] = [];

  for (const f of filters) {
    if (!OPERATORS[f.operator]) throw new Error(`Invalid operator: ${f.operator}`);
    const op = OPERATORS[f.operator](f.value);

    if (f.operator === 'in') {
      const values = Array.isArray(op.value) ? op.value : [op.value];
      const placeholders = values.map(() => `$${paramIndex++}`).join(', ');
      const cond = `${f.field} ${op.operator} (${placeholders})`;
      conditions.push(cond);
      params.push(...values);
      logger.debug(`  IN → ${cond}`, { context: CTX, values });
    } else if (f.operator === 'between') {
      const cond = `${f.field} ${op.operator} $${paramIndex} AND $${paramIndex + 1}`;
      conditions.push(cond);
      params.push(...op.value);
      paramIndex += 2;
      logger.debug(`  BETWEEN → ${cond}`, { context: CTX, values: op.value });
    } else {
      const cond = `${f.field} ${op.operator} $${paramIndex++}`;
      conditions.push(cond);
      params.push(op.value);
      logger.debug(`  ${f.operator} → ${cond} = "${op.value}"`, { context: CTX });
    }
  }

  if (conditions.length === 0) return { whereClause: '', params: [] };

  const hasMixed = filters.some(f => f.logic);
  let whereClause: string;

  if (!hasMixed) {
    const sep = matchLogic === 'OR' ? ' OR ' : ' AND ';
    whereClause = `WHERE ${conditions.join(sep)}`;
  } else {
    let clause = conditions[0];
    for (let i = 1; i < conditions.length; i++) {
      const logic = filters[i].logic || matchLogic;
      clause = `(${clause}) ${logic} ${conditions[i]}`;
    }
    whereClause = `WHERE ${clause}`;
  }

  logger.debug(`WHERE clause built: ${whereClause}`, { context: CTX });
  return { whereClause, params };
}
