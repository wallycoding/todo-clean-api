import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? '*' });

  setupSwagger(app);
  await app.listen(3000);
}

const setupSwagger = (app: INestApplication<any>) => {
  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('The todo API description')
    .setVersion('1.0')
    .addTag('todo-list')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
};

bootstrap();
