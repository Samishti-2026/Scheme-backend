import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { CryptoService } from '../common/crypto.service';

@Injectable({ scope: Scope.REQUEST })
export class TenantsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Tenant)
    private readonly repository: Repository<Tenant>,
    private readonly crypto: CryptoService,
  ) {}

  getTenantId(): string {
    // SECURITY: Only trust tenantId from the verified JWT payload.
    // Never trust the x-tenant-id header from the client — it can be spoofed.
    const user = (this.request as any).user;
    if (user?.tenantId != null) return String(user.tenantId);

    return 'default';
  }

  findAll() {
    return this.repository.find();
  }

  async create(data: Partial<Tenant>) {
    const tenant = this.repository.create({
      ...data,
      // Encrypt the DB connection string before persisting
      connectionUri: data.connectionUri ? this.crypto.encrypt(data.connectionUri) : data.connectionUri,
    });
    return this.repository.save(tenant);
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.repository.findOne({ where: { slug } });
  }

  /** Returns the decrypted DB name/URI for internal use only */
  decryptConnectionUri(encryptedDbName: string): string {
    if (!encryptedDbName) return encryptedDbName;
    // Graceful fallback: if value is not encrypted (legacy plaintext), return as-is
    return this.crypto.isEncrypted(encryptedDbName)
      ? this.crypto.decrypt(encryptedDbName)
      : encryptedDbName;
  }
}
