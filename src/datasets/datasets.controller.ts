import { Controller, Get, Query, Inject, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Customer } from '../common/entities/customer.entity';
import { Material } from '../common/entities/material.entity';
import { Billing } from '../common/entities/billing.entity';
import { Payment } from '../common/entities/payment.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

@Controller()
export class DatasetsController {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) { }

  @Get('datasets')
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  async getDatasets() {
    if (!this.dataSource) {
      return { database: 'none', datasets: [] };
    }

    const entities = [
      { name: 'customer', entity: Customer },
      { name: 'material', entity: Material },
      { name: 'billing', entity: Billing },
      { name: 'payment', entity: Payment },
    ];

    const fieldsData = entities.map(({ name, entity }) => {
      const metadata = this.dataSource.getMetadata(entity);
      const fields = metadata.columns.map(column => {
        let type = 'string';
        const columnType = column.type?.toString().toLowerCase();

        if (['numeric', 'integer', 'int4', 'decimal', 'float'].some(t => columnType?.includes(t))) {
          type = 'number';
        } else if (['timestamp', 'date'].some(t => columnType?.includes(t))) {
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

  @Get('filter-values')
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  async getFilterValues(
    @Query('table') table: string,
    @Query('column') column: string,
  ) {
    if (!this.dataSource || !table || !column) return [];

    const allowedTables = ['customer', 'material', 'billing', 'payment'];
    const safeTable = table.toLowerCase();
    if (!allowedTables.includes(safeTable)) return [];

    // Validate column name — only allow alphanumeric + underscore
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) return [];

    // Validate column exists in entity metadata to prevent arbitrary column access
    const entityMap: Record<string, any> = {
      customer: Customer, material: Material, billing: Billing, payment: Payment,
    };
    const metadata = this.dataSource.getMetadata(entityMap[safeTable]);
    const validColumns = metadata.columns.map(c => c.databaseName);
    if (!validColumns.includes(column)) return [];

    try {
      const results: any[] = await this.dataSource.query(
        `SELECT DISTINCT "${column}" as val FROM "${safeTable}" WHERE "${column}" IS NOT NULL ORDER BY val LIMIT 100`
      );
      return results.map((r: any) => {
        const val = r.val;
        if (val instanceof Date) return val.toISOString().split('T')[0];
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) return val.split('T')[0];
        return val;
      });
    } catch (error) {
      console.error(`Error fetching filter values for ${safeTable}.${column}:`, error);
      return [];
    }
  }
}
