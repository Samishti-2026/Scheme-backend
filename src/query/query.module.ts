import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  controllers: [QueryController],
  providers: [QueryService, RolesGuard],
  exports: [QueryService],
})
export class QueryModule {}
