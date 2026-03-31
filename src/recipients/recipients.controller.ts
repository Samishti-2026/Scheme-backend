import { Controller, Get, Post, Query, Body, Inject, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

interface FilterRule {
  collection: string;
  field: string;
  operator: string;
  value: any;
  logic?: 'AND' | 'OR';
}

const TABLE_ALIAS: Record<string, string> = {
  customer: 'c',
  billing: 'b',
  payment: 'p',
};

function buildCondition(alias: string, field: string, operator: string, value: any, paramIdx: number): { sql: string; params: any[] } {
  const col = `${alias}.${field}`;
  const p = '$';

  // Normalize ISO timestamps to YYYY-MM-DD
  const normalizeDate = (v: any) => {
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.split('T')[0];
    return v;
  };

  // Cast column to date when value looks like YYYY-MM-DD
  const isDateValue = (v: any) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v);
  const normalizedValue = normalizeDate(value);
  const colExpr = isDateValue(normalizedValue) ? `${col}::date` : col;

  switch (operator) {
    case 'eq':         return { sql: `${colExpr} = ${p}${paramIdx}`, params: [normalizedValue] };
    case 'ne':         return { sql: `${colExpr} != ${p}${paramIdx}`, params: [normalizedValue] };
    case 'gt':         return { sql: `${colExpr} > ${p}${paramIdx}`, params: [normalizedValue] };
    case 'gte':        return { sql: `${colExpr} >= ${p}${paramIdx}`, params: [normalizedValue] };
    case 'lt':         return { sql: `${colExpr} < ${p}${paramIdx}`, params: [normalizedValue] };
    case 'lte':        return { sql: `${colExpr} <= ${p}${paramIdx}`, params: [normalizedValue] };
    case 'contains':   return { sql: `${col} ILIKE ${p}${paramIdx}`, params: [`%${normalizedValue}%`] };
    case 'startsWith': return { sql: `${col} ILIKE ${p}${paramIdx}`, params: [`${normalizedValue}%`] };
    case 'endsWith':   return { sql: `${col} ILIKE ${p}${paramIdx}`, params: [`%${normalizedValue}`] };
    case 'in': {
      // Handle both array and comma-separated string
      const rawVals = Array.isArray(value)
        ? value
        : String(value).split(',').map((v: string) => v.trim()).filter(Boolean);
      const vals = rawVals.map(normalizeDate);
      const useDate = vals.some(isDateValue);
      const castCol = useDate ? `${col}::date` : col;
      const placeholders = vals.map((_: any, i: number) => `${p}${paramIdx + i}`).join(', ');
      return { sql: `${castCol} IN (${placeholders})`, params: vals };
    }
    default: return { sql: `${colExpr} = ${p}${paramIdx}`, params: [normalizedValue] };
  }
}

@Controller('recipients')
export class RecipientsController {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  private async queryCustomers(filters: FilterRule[] = []) {
    const allParams: any[] = [];
    const whereConds: string[] = [];
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
    return rows.map((r: any) => ({
      ...r,
      currentTO: Number(r.qty_till_date),
      avgDaily: Number(r.avg_daily_qty),
      invoiceDate: r.inv_date,
      paymentDate: r.pay_date,
    }));
  }

  @Get()
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  async findAll(@Query('recipientType') recipientType: string) {
    if (recipientType === 'customer') {
      const rows = await this.queryCustomers();
      console.log('[Recipients] rows returned:', rows.length);
      return rows;
    }
    return [];
  }

  @Post('query')
  @Roles('Admin', 'Executive', 'Manager')
  @UseGuards(new RolesGuard(new Reflector()))
  async queryWithFilters(
    @Body() body: { recipientType?: string; filters?: FilterRule[] },
  ) {
    const { recipientType = 'customer', filters = [] } = body;
    if (recipientType === 'customer') {
      const rows = await this.queryCustomers(filters);
      console.log('[Recipients/query] filters:', filters.length, '→ rows:', rows.length);
      return rows;
    }
    return [];
  }

  @Get('filter-options')
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  async getFilterOptions() {
    return [
      { name: 'Customer', options: ['customer_name', 'country', 'region', 'customer_group'] },
    ];
  }

  @Get('types')
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  getRecipientTypes() {
    return [
      { key: 'customer', label: 'Customer' },
      { key: 'distributor', label: 'Distributor' },
      { key: 'sales_executive', label: 'Sales Executive' },
    ];
  }
}
