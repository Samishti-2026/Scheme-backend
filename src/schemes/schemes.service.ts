import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository, ILike } from 'typeorm';
import { Scheme } from './scheme.entity';

export interface SchemeFilters {
  region?: string;
  type?: string;
  search?: string;
  status?: string;
}

@Injectable()
export class SchemesService {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  private get repository(): Repository<Scheme> {
    return this.dataSource.getRepository(Scheme);
  }

  async findAll(filters: SchemeFilters = {}) {
    const where: any = {};

    if (filters.status)  where.status     = filters.status;
    if (filters.region)  where.region     = filters.region;
    if (filters.type)    where.targetType = filters.type;
    if (filters.search)  where.name       = ILike(`%${filters.search}%`);

    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    return this.repository.findOne({ where: { id } as any });
  }

  async create(data: Partial<Scheme>) {
    const scheme = this.repository.create(data);
    return this.repository.save(scheme);
  }

  async update(id: string, data: Partial<Scheme>) {
    await this.repository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repository.delete(id);
  }
}
