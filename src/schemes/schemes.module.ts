import { Module } from '@nestjs/common';
import { SchemesController } from './schemes.controller';
import { SchemesService } from './schemes.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  controllers: [SchemesController],
  providers: [SchemesService, RolesGuard],
  exports: [SchemesService],
})
export class SchemesModule {}
