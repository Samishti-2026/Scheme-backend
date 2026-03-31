import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { buildMatch, FilterDef } from './utils/filter-builder';
import { buildJoinPlan } from './utils/join-planner';
import { OPERATORS } from './utils/operators';
import { ALLOWED_TABLES } from './utils/relations';
import { winstonInstance as logger } from '../common/winston.logger';

const CTX = 'QueryService';

export interface QueryFilter {
  collection: string;
  field: string;
  operator: string;
  value: any;
  logic?: 'AND' | 'OR';
}

export interface AggregationOp {
  operator: 'sum' | 'avg' | 'min' | 'max' | 'count';
  collection: string;
  field: string;
  alias?: string;
}

export interface GroupByField {
  collection: string;
  field: string;
}

export interface HavingFilter {
  field: string;
  operator: string;
  value: any;
}

@Injectable()
export class QueryService {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  private validateFilter(f: QueryFilter) {
    if (!ALLOWED_TABLES.includes(f.collection))
      throw new BadRequestException(`Invalid collection: ${f.collection}`);
    if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(f.field))
      throw new BadRequestException(`Invalid field name: ${f.field}`);
    const allowed = ['eq','ne','gt','gte','lt','lte','contains','startsWith','endsWith','between','in'];
    if (!allowed.includes(f.operator))
      throw new BadRequestException(`Invalid operator: ${f.operator}`);
  }

  private resolveRoot(filters: QueryFilter[]): string {
    const cols = [...new Set(filters.map(f => f.collection))];
    if (cols.includes('billing')) return 'billing';
    if (cols.length > 1) return 'billing';
    return cols[0] || 'billing';
  }

  private resolveField(root: string, collection: string, field: string): string {
    return collection === root ? field : `${collection}.${field}`;
  }

  async execute(
    filters: QueryFilter[] = [],
    matchLogic: 'AND' | 'OR' = 'AND',
    aggregation: AggregationOp[] = [],
    having: HavingFilter[] = [],
    groupBy: GroupByField[] = [],
  ) {
    logger.info(`execute() called`, {
      context: CTX,
      filters: filters.length,
      matchLogic,
      aggregation: aggregation.length,
      groupBy: groupBy.length,
    });

    filters.forEach(f => {
      logger.debug(`Validating filter: ${f.collection}.${f.field} ${f.operator} "${f.value}"`, { context: CTX });
      this.validateFilter(f);
    });

    const root = this.resolveRoot(filters);
    logger.debug(`Root table: "${root}"`, { context: CTX });

    const joins = buildJoinPlan(root, filters);
    logger.debug(`Joins: ${joins.map(j => `${j.type} ${j.table}`).join(', ') || '(none)'}`, { context: CTX });

    const matchFilters: FilterDef[] = filters.map(f => ({
      field: this.resolveField(root, f.collection, f.field),
      operator: f.operator,
      value: f.value,
      logic: f.logic,
    }));
    const { whereClause, params } = buildMatch(matchFilters, matchLogic);
    logger.debug(`WHERE: ${whereClause || '(none)'}`, { context: CTX, params });

    let selectClause = '*';
    if (aggregation.length > 0) {
      const parts: string[] = [];
      groupBy.forEach(g => parts.push(`${this.resolveField(root, g.collection, g.field)} AS ${g.field}`));
      aggregation.forEach(op => {
        const col   = this.resolveField(root, op.collection, op.field);
        const alias = op.alias || `${op.operator}_${op.field}`;
        parts.push(op.operator === 'count' ? `COUNT(*) AS ${alias}` : `${op.operator.toUpperCase()}(${col}) AS ${alias}`);
      });
      selectClause = parts.join(', ');
    }

    const joinClause    = joins.map(j => `${j.type} ${j.table} ON ${j.condition}`).join(' ');
    const groupByClause = groupBy.length > 0
      ? `GROUP BY ${groupBy.map(g => this.resolveField(root, g.collection, g.field)).join(', ')}`
      : '';

    let havingClause = '';
    if (having.length > 0) {
      const havingParts = having.map(h => {
        const op = OPERATORS[h.operator](h.value);
        params.push(op.value);
        // Fix: $N positional param continuing from WHERE params (was missing the $ prefix)
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

    logger.info(`Executing SQL`, { context: CTX, sql, db: this.dataSource.options.database });

    const rows = await this.dataSource.query(sql, params);

    logger.info(`Query returned ${rows.length} row(s)`, { context: CTX });

    return aggregation.length > 0
      ? { type: 'aggregation', query: sql, aggregation_data: rows, aggregation_count: rows.length }
      : { type: 'regular', query: sql, data: rows, count: rows.length };
  }

  async getFieldValues(collection: string, field: string): Promise<string[]> {
    logger.debug(`getFieldValues("${collection}", "${field}")`, { context: CTX });

    if (!ALLOWED_TABLES.includes(collection))
      throw new BadRequestException(`Invalid collection: ${collection}`);
    if (/[$;'"\\]/.test(field))
      throw new BadRequestException(`Invalid field: ${field}`);

    const rows = await this.dataSource.query(
      `SELECT DISTINCT "${field}"::text as val FROM "${collection}" WHERE "${field}" IS NOT NULL ORDER BY val LIMIT 200`,
    );
    logger.debug(`getFieldValues returned ${rows.length} value(s)`, { context: CTX });
    return rows.map((r: any) => r.val);
  }
}
