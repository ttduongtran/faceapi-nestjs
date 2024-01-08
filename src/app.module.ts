import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';

// UPLOAD FROM LOCAL
import { FaceController } from './controllers/face.controller';
import { FaceService } from './services/face.service';

// UPLOAD FROM URL
import { FetcherController } from './controllers/fetcher.controller';
import { ImageUploadService } from './services/image-upload.service';

@Module({
  imports: [ConfigModule.forRoot(), MulterModule.register({ dest: 'upload' })],
  controllers: [AppController, FaceController, FetcherController],
  providers: [AppService, FaceService, ImageUploadService],
})
export class AppModule {}
