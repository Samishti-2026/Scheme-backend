import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { Tenant } from './tenant.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

function toClientShape(t: Tenant) {
  return {
    id: t.id,
    name: t.name,
    code: t.slug,
    isActive: true,
    color: '#06b6d4',
    logoUrl: null,
    industry: null,
    startDate: t.startDate,
    expiryDate: t.expiryDate,
  };
}

@Controller('tenants')
@UseGuards(RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  async findAll() {
    const tenants = await this.tenantsService.findAll();
    return tenants.map(toClientShape);
  }

  @Post()
  @Roles('Admin')
  async create(@Body() data: Partial<Tenant>) {
    const tenant = await this.tenantsService.create(data);
    return toClientShape(tenant);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tenant = await this.tenantsService.findOne(+id);
    if (!tenant) return null;
    return toClientShape(tenant);
  }
}
