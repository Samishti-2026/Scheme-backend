import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

@Controller('dashboard')
export class DashboardController {
  @Get('summary')
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  async getSummary() {
    return {
      quarterLabel: 'Q3 2024',
      changePercent: '+14.2%',
      totalSales: '₹42.5L',
      salesTarget: '₹50L',
      progressPercent: 85,
    };
  }

  @Get('upcoming-schemes')
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  async getUpcomingSchemes() {
    return [
      { id: 1, name: 'Summer Bonanza', startDate: '2024-06-01', target: '₹10M' },
      { id: 2, name: 'Q3 Growth Stimulus', startDate: '2024-07-15', target: '500+ Qty' },
    ];
  }
}
