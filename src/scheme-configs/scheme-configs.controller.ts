import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, NotFoundException, Req } from '@nestjs/common';
import type { Request } from 'express';
import { SchemeConfigsService } from './scheme-configs.service';
import { SchemeConfig } from './scheme-config.entity';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

@ApiTags('scheme-configs')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('scheme-config')
export class SchemeConfigsController {
  constructor(private readonly schemeConfigsService: SchemeConfigsService) {}

  @Get()
  async findAll(@Query('name') name?: string) {
    if (name) {
      const result = await this.schemeConfigsService.findByName(name);
      if (!result) throw new NotFoundException(`Config '${name}' not found`);
      return result;
    }
    return this.schemeConfigsService.findAll();
  }

  @Get('all')
  findAllConfigs() {
    return this.schemeConfigsService.findAll();
  }

  @Post()
  @Roles('Admin')
  @UseGuards(new RolesGuard(new Reflector()))
  create(@Body() body: { name?: string; config: any }, @Req() req: Request) {
    const actor = (req as any).user?.id ? String((req as any).user.id) : undefined;
    return this.schemeConfigsService.createConfig(body.name || 'default', body.config, actor);
  }

  @Put(':id')
  @Roles('Admin')
  @UseGuards(new RolesGuard(new Reflector()))
  update(@Param('id') id: string, @Body() data: Partial<SchemeConfig>, @Req() req: Request) {
    const actor = (req as any).user?.id ? String((req as any).user.id) : undefined;
    return this.schemeConfigsService.update(+id, data, actor);
  }

  @Delete(':id')
  @Roles('Admin')
  @UseGuards(new RolesGuard(new Reflector()))
  remove(@Param('id') id: string) {
    return this.schemeConfigsService.remove(+id);
  }
}
