import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipientsController } from './recipients.controller';
import { Customer } from '../common/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [RecipientsController],
})
export class RecipientsModule {}
