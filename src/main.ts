import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  app.enableCors();

  const port = app.get(ConfigService).get('APP_PORT') || 4000;
  // console.log(port);
  await app.listen(port, () =>
    console.log(`🚀 Application is listening on http://127.0.0.1:${port}`),
  );
}
bootstrap();
