import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UserMiddleware } from './auth/user.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from './tenants/tenants.module';
import { SchemeConfigsModule } from './scheme-configs/scheme-configs.module';
import { SchemesModule } from './schemes/schemes.module';
import { DatabaseModule } from './database/database.module';
import { Tenant } from './tenants/tenant.entity';
import { Customer } from './common/entities/customer.entity';
import { Material } from './common/entities/material.entity';
import { Billing } from './common/entities/billing.entity';
import { Payment } from './common/entities/payment.entity';
import { CustomersModule } from './customers/customers.module';
import { MaterialsModule } from './materials/materials.module';
import { BillingsModule } from './billings/billings.module';
import { PaymentsModule } from './payments/payments.module';
import { DatasetsModule } from './datasets/datasets.module';
import { RecipientsModule } from './recipients/recipients.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { QueryModule } from './query/query.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Main connection to Scheme_Tool_DB
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [Tenant, Customer, Material, Billing, Payment],
        synchronize: false,
      }),
    }),
    DatabaseModule,
    TenantsModule,
    SchemeConfigsModule,
    SchemesModule,
    CustomersModule,
    MaterialsModule,
    BillingsModule,
    PaymentsModule,
    DatasetsModule,
    RecipientsModule,
    AnalyticsModule,
    DashboardModule,
    SettingsModule,
    AuthModule,
    QueryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
