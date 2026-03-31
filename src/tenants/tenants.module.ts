import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { Tenant } from './tenant.entity';
import { TenantsController } from './tenants.controller';
import { CryptoService } from '../common/crypto.service';
import { RolesGuard } from '../auth/roles.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantsController],
  providers: [TenantsService, CryptoService, RolesGuard],
  exports: [TenantsService],
})
export class TenantsModule {}
