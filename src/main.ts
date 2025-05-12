import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { session } from 'telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(session());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
