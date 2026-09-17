import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { buildValidationPipe } from './common/validation-pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(buildValidationPipe());
  await app.listen(process.env.BACKEND_PORT ?? 3000);
}
bootstrap();
