import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

@Controller('analytics')
export class AnalyticsController {
  @Get('kpis')
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  async getKpis() {
    return {
      totalRevenue: '₹4.2M',
      revenueChange: '+12%',
      activeSchemes: 12,
      schemesChange: '+2',
      avgOrderValue: '₹35,200',
      avgOrderChange: '+5.4%',
    };
  }

  @Get('chart')
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  async getChart() {
    return [
      { name: 'Mon', value: 400 },
      { name: 'Tue', value: 300 },
      { name: 'Wed', value: 600 },
      { name: 'Thu', value: 800 },
      { name: 'Fri', value: 500 },
      { name: 'Sat', value: 900 },
      { name: 'Sun', value: 700 },
    ];
  }
}
