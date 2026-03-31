import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SchemesService } from './schemes.service';
import { Scheme } from './scheme.entity';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('schemes')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('schemes')
@UseGuards(RolesGuard) // Fix Q11: use DI-managed guard, not manually instantiated
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) {}

  @Get()
  findAll(
    @Query('region') region?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    // Fix Q12: pass query params to service instead of ignoring them
    return this.schemesService.findAll({ region, type, search, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schemesService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Executive', 'Manager')
  create(@Body() data: Partial<Scheme>) {
    return this.schemesService.create(data);
  }

  @Put(':id')
  @Roles('Admin', 'Executive', 'Manager')
  update(@Param('id') id: string, @Body() data: Partial<Scheme>) {
    return this.schemesService.update(id, data);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: string) {
    return this.schemesService.remove(id);
  }
}
