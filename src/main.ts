import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  // Validation globale des DTOs avec class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtre d'exception global pour standardiser les erreurs (HttpException, TypeORM, etc.)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Intercepteurs globaux : Logs d'exécution + standardisation des réponses (avec support @BypassTransform)
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseTransformInterceptor(reflector),
  );

  // Documentation interactive Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('Nest Core Kit API')
    .setDescription('Documentation des endpoints et du kit transversal')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application démarrée sur le port ${port}`);
  console.log(`Documentation Swagger accessible sur : http://localhost:${port}/api/docs`);
}
bootstrap();

