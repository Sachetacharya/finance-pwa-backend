import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // CORS_ORIGINS env var = comma-separated list of allowed origins
  // e.g.  CORS_ORIGINS=https://your-app.netlify.app,https://your-custom-domain.com
  const rawOrigins = process.env.CORS_ORIGINS;
  const corsOrigin = rawOrigins
    ? rawOrigins.split(',').map(o => o.trim())
    : true; // allow all origins when env var is not set

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Finance PWA API')
    .setDescription('Backend API for Finance PWA — expense tracking with offline sync')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}/api`);
  console.log(`Swagger docs:     http://localhost:${port}/api/docs`);
}
bootstrap();
