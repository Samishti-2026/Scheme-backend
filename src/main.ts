import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { WinstonLogger, winstonInstance } from './common/winston.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonLogger, // all NestJS internal logs → Winston → logs/app.log
  });

  app.setGlobalPrefix('api');

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
  }));

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-tenant-id'],
    credentials: true, // required for cookies to be sent cross-origin
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Samishti Schemes API')
    .setDescription('API documentation for Samishti Schemes backend')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  // Global HTTP request/response logger
  const httpAdapter = app.getHttpAdapter().getInstance();
  httpAdapter.use((req: any, res: any, next: any) => {
    const start = Date.now();
    const { method, originalUrl } = req;
    const tenantId = req.headers['x-tenant-id'] || '—';

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`[HTTP] ▶ ${method} ${originalUrl}`);
    console.log(`[HTTP]   tenant=${tenantId}`);

    res.on('finish', () => {
      const ms     = Date.now() - start;
      const status = res.statusCode;
      const icon   = status >= 500 ? '✘' : status >= 400 ? '⚠' : '✔';
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
