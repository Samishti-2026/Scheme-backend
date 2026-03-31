import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { Material } from '../common/entities/material.entity';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

@ApiTags('materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly service: MaterialsService) {}

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
  create(@Body() data: Partial<Material>) {
    return this.service.create(data);
  }
}
