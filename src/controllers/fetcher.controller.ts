import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { FaceService } from '../services/face.service';
import { ImageUploadService } from 'src/services/image-upload.service';

// import axios from 'axios';

@Controller('fetchers')
export class FetcherController {
  constructor(
    private readonly faceService: FaceService,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  @Post('encoding')
  @UseInterceptors()
  async encoding(
    @Res() res,
    @Query('url') url,
    @Query('mode') mode,
    @Query('render') render,
    @Query('renderLandmark') renderLandmark,
  ) {
    try {
      const isMultiple = mode === 'multiple';
      const isRender = render === 'true';
      const isRenderLandmark = renderLandmark === 'true';

      const imgPath = await this.imageUploadService.uploadImageFromUrl(url);

      let result: any;
      if (isMultiple) {
        result = await this.faceService.encodings(
          imgPath,
          isRender,
          isRenderLandmark,
        );
      } else {
        result = await this.faceService.encoding(
          imgPath,
          isRender,
          isRenderLandmark,
        );
      }

      if (isRender || isRenderLandmark) {
        res.writeHead(200, {
          'Content-Type': 'image/jpeg',
          'Content-Length': result.length,
        });
        res.end(result);
      } else {
        res.send({ data: result });
      }
    } catch (e) {
      throw new HttpException(
        { message: e.message },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('landmark')
  @UseInterceptors()
  async landmark(
    @Res() res,
    @Query('url') url,
    @Query('mode') mode,
    @Query('render') render,
    @Query('renderLandmark') renderLandmark,
  ) {
    try {
      const isMultiple = mode === 'multiple';
      const isRender = render === 'true';
      const isRenderLandmark = renderLandmark === 'true';

      const imgPath = await this.imageUploadService.uploadImageFromUrl(url);

      let result: any;
      if (isMultiple) {
        result = await this.faceService.landmarks(
          imgPath,
          isRender,
          isRenderLandmark,
        );
      } else {
        result = await this.faceService.landmark(
          imgPath,
          isRender,
          isRenderLandmark,
        );
      }

      if (isRender || isRenderLandmark) {
        res.writeHead(200, {
          'Content-Type': 'image/jpeg',
          'Content-Length': result.length,
        });
        res.end(result);
      } else {
        res.send({ data: result });
      }
    } catch (e) {
      throw new HttpException(
        { message: e.message },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
