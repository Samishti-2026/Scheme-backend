"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const user_middleware_1 = require("./auth/user.middleware");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const tenants_module_1 = require("./tenants/tenants.module");
const scheme_configs_module_1 = require("./scheme-configs/scheme-configs.module");
const schemes_module_1 = require("./schemes/schemes.module");
const database_module_1 = require("./database/database.module");
const tenant_entity_1 = require("./tenants/tenant.entity");
const customer_entity_1 = require("./common/entities/customer.entity");
const material_entity_1 = require("./common/entities/material.entity");
const billing_entity_1 = require("./common/entities/billing.entity");
const payment_entity_1 = require("./common/entities/payment.entity");
const customers_module_1 = require("./customers/customers.module");
const materials_module_1 = require("./materials/materials.module");
const billings_module_1 = require("./billings/billings.module");
const payments_module_1 = require("./payments/payments.module");
const datasets_module_1 = require("./datasets/datasets.module");
const recipients_module_1 = require("./recipients/recipients.module");
const analytics_module_1 = require("./analytics/analytics.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const settings_module_1 = require("./settings/settings.module");
const auth_module_1 = require("./auth/auth.module");
const query_module_1 = require("./query/query.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(user_middleware_1.UserMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    database: configService.get('DB_DATABASE'),
                    entities: [tenant_entity_1.Tenant, customer_entity_1.Customer, material_entity_1.Material, billing_entity_1.Billing, payment_entity_1.Payment],
                    synchronize: false,
                }),
            }),
            database_module_1.DatabaseModule,
            tenants_module_1.TenantsModule,
            scheme_configs_module_1.SchemeConfigsModule,
            schemes_module_1.SchemesModule,
            customers_module_1.CustomersModule,
            materials_module_1.MaterialsModule,
            billings_module_1.BillingsModule,
            payments_module_1.PaymentsModule,
            datasets_module_1.DatasetsModule,
            recipients_module_1.RecipientsModule,
            analytics_module_1.AnalyticsModule,
            dashboard_module_1.DashboardModule,
            settings_module_1.SettingsModule,
            auth_module_1.AuthModule,
            query_module_1.QueryModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map