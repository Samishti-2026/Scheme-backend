import { Controller, Get, Put, Body, Inject, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

const DEFAULT_SETTINGS = {
  displayName: '',
  email: '',
  emailAlerts: true,
  weeklyReports: true,
  systemUpdates: true,
};

@Controller('settings')
export class SettingsController {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  @Get()
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  async getSettings() {
    if (!this.dataSource) return DEFAULT_SETTINGS;
    try {
      const rows = await this.dataSource.query(
        `SELECT value FROM app_settings WHERE key = 'user_settings' LIMIT 1`,
      );
      if (rows.length > 0) return JSON.parse(rows[0].value);
    } catch {
      // table may not exist yet — return defaults
    }
    return DEFAULT_SETTINGS;
  }

  @Put()
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  async updateSettings(@Body() data: Record<string, any>) {
    if (!this.dataSource) return { ...DEFAULT_SETTINGS, ...data };
    try {
      await this.dataSource.query(
        `INSERT INTO app_settings (key, value)
         VALUES ('user_settings', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify({ ...DEFAULT_SETTINGS, ...data })],
      );
    } catch {
      // table may not exist — silently return merged data
    }
    return { ...DEFAULT_SETTINGS, ...data };
  }
}
