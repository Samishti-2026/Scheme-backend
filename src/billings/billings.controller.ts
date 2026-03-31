import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BillingsService } from './billings.service';
import { Billing } from '../common/entities/billing.entity';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

@ApiTags('billings')
@Controller('billings')
export class BillingsController {
  constructor(private readonly service: BillingsService) {}

  @Get()
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  @UseGuards(new RolesGuard(new Reflector()))
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  @Roles('Admin', 'Executive')
  @UseGuards(new RolesGuard(new Reflector()))
  create(@Body() data: Partial<Billing>) {
    return this.service.create(data);
  }
}
