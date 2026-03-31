"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const winston_logger_1 = require("./common/winston.logger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: winston_logger_1.WinstonLogger,
    });
    app.setGlobalPrefix('api');
    app.use((0, cookie_parser_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:4173',
            process.env.FRONTEND_URL,
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'x-tenant-id'],
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Samishti Schemes API')
        .setDescription('API documentation for Samishti Schemes backend')
        .setVersion('1.0')
        .build();
    swagger_1.SwaggerModule.setup('docs', app, swagger_1.SwaggerModule.createDocument(app, config));
    const httpAdapter = app.getHttpAdapter().getInstance();
    httpAdapter.use((req, res, next) => {
        const start = Date.now();
        const { method, originalUrl } = req;
        const tenantId = req.headers['x-tenant-id'] || '—';
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`[HTTP] ▶ ${method} ${originalUrl}`);
        console.log(`[HTTP]   tenant=${tenantId}`);
        res.on('finish', () => {
            const ms = Date.now() - start;
            const status = res.statusCode;
            const icon = status >= 500 ? '✘' : status >= 400 ? '⚠' : '✔';
            console.log(`[HTTP] ${icon} ${method} ${originalUrl} → ${status} (${ms}ms)`);
            console.log(`${'─'.repeat(60)}`);
        });
        next();
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  Samishti Schemes API running on http://localhost:${port}/api`);
    console.log(`  Swagger docs        → http://localhost:${port}/docs`);
    console.log(`${'═'.repeat(60)}\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map