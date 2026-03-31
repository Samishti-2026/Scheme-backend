import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SchemeConfig } from './scheme-config.entity';

@Injectable()
export class SchemeConfigsService {

  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  private get repository(): Repository<SchemeConfig> {
    return this.dataSource.getRepository(SchemeConfig);
  }

  async findAll() {
    return this.repository.find();
  }

  async createConfig(name: string, config: any, actorName?: string) {
    const existing = await this.repository.findOne({ where: { name } });
    if (existing) throw new ConflictException(`Config '${name}' already exists. Use PUT to update it.`);
    const record = this.repository.create({ name, config, createdBy: actorName, updatedBy: actorName });
    return this.repository.save(record);
  }

  async upsertByName(name: string, config: any) {
    const existing = await this.repository.findOne({ where: { name } });
    if (existing) {
      await this.repository.update(existing.id, { config });
      return this.repository.findOne({ where: { name } });
    }
    const record = this.repository.create({ name, config });
    return this.repository.save(record);
  }

  async findByName(name: string) {
    return this.repository.findOne({ where: { name } });
  }

  async create(data: Partial<SchemeConfig>) {
    const config = this.repository.create(data);
    return this.repository.save(config);
  }

  async findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<SchemeConfig>, actorName?: string) {
    await this.repository.update(id, { ...data, updatedBy: actorName });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repository.delete(id);
  }
}
