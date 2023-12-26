import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { FaceController } from './controllers/face.controller';
import { FaceService } from './services/face.service';

@Module({
  imports: [ConfigModule.forRoot(), MulterModule.register({ dest: 'upload' })],
  controllers: [AppController, FaceController],
  providers: [AppService, FaceService],
})
export class AppModule {}
