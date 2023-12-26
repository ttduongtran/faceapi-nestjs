// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
// import '@tensorflow/tfjs-node';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as faceapi from 'face-api.js';
import { TinyFaceDetectorOptions } from 'face-api.js';
import { unlink } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

@Injectable()
export class FaceService {
  private _canvas: any;
  private removeFile: Promise<any> | any;
  private faceDetectorOptions: TinyFaceDetectorOptions;

  constructor(private readonly configService: ConfigService) {
    this.initFaceAPI();

    // configure face detector variable
    const scoreThreshold = Number(
      this.configService.get('SCORE_THRESHOLD', 0.5),
    );
    const inputSize = Number(this.configService.get('INPUT_SIZE', 640));
    this.faceDetectorOptions = new TinyFaceDetectorOptions({
      scoreThreshold: scoreThreshold,
      inputSize: inputSize,
    });

    // create promisify unlink (for remove file)
    this.removeFile = promisify(unlink);
  }

  async initFaceAPI() {
    // implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
    this._canvas = require('canvas');

    // patch nodejs environment, we need to provide an implementation of
    // HTMLCanvasElement and HTMLImageElement
    const { Canvas, Image, ImageData } = this._canvas;
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

    // load weights
    await faceapi.nets.tinyFaceDetector.loadFromDisk(
      join(__dirname, '../..', 'models'),
    );
    await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(
      join(__dirname, '../..', 'models'),
    );
    await faceapi.nets.faceRecognitionNet.loadFromDisk(
      join(__dirname, '../..', 'models'),
    );
    // await faceapi.nets.faceExpressionNet.loadFromDisk(
    //   join(__dirname, '../..', 'models'),
    // );
    // await faceapi.nets.ageGenderNet.loadFromDisk(
    //   join(__dirname, '../..', 'models'),
    // );
  }

  get canvas() {
    return this._canvas;
  }

  drawFace(
    result: any,
    image: any,
    isRender: boolean,
    isRenderLandmark: boolean,
    isRenderExpression?: boolean,
    isRenderAgeAndGender?: boolean,
  ) {
    const out = faceapi.createCanvasFromMedia(image) as any;
    if (isRender) {
      faceapi.draw.drawDetections(
        out,
        Array.isArray(result)
          ? result.map((o) => o.detection)
          : result.detection,
      );
    }
    if (isRenderLandmark) {
      faceapi.draw.drawFaceLandmarks(
        out,
        Array.isArray(result)
          ? result.map((o) => o.landmarks)
          : result.landmarks,
      );
    }
    if (isRenderExpression) {
      faceapi.draw.drawFaceExpressions(
        out,
        Array.isArray(result)
          ? result.map((o) => o.expressions)
          : result.expressions,
      );
    }
    if (isRenderAgeAndGender) {
      result.forEach((o) => {
        const { age, gender, genderProbability } = o;
        new faceapi.draw.DrawTextField(
          [
            `${faceapi.utils.round(age, 0)} years`,
            `${gender} (${faceapi.utils.round(genderProbability)})`,
          ],
          result.detection.box.bottomLeft,
        ).draw(out);
      });
    }

    // saveFile('ageAndGenderRecognition.jpg', out.toBuffer('image/jpeg'));
    // console.log('done, saved results to out/ageAndGenderRecognition.jpg');
    return out.toBuffer('image/jpeg');
  }

  async encoding(
    imagePath: string,
    isRender: boolean,
    isRenderLandmark: boolean,
  ) {
    const image = await this.canvas.loadImage(imagePath);
    await this.removeFile(imagePath);

    const result = await faceapi
      .detectSingleFace(image, this.faceDetectorOptions)
      .withFaceLandmarks(true)
      .withFaceDescriptor();
    // .withAgeAndGender()
    // .withFaceExpressions()
    console.log(
      '🚀 ~ file: face.service.ts:98 ~ FaceService ~ result:',
      result,
    );
    if (isRender || isRenderLandmark) {
      return this.drawFace(result, image, isRender, isRenderLandmark);
    } else {
      return {
        detection: {
          x: result.alignedRect.box.x,
          y: result.alignedRect.box.y,
          width: result.alignedRect.box.width,
          height: result.alignedRect.box.height,
          score: result.alignedRect.score,
        },
        encodings: Array.from(result.descriptor),
      };
    }
  }

  async encodings(
    imagePath: string,
    isRender: boolean,
    isRenderLandmark: boolean,
  ) {
    const image = await this.canvas.loadImage(imagePath);
    await this.removeFile(imagePath);

    const result = await faceapi
      .detectAllFaces(image, this.faceDetectorOptions)
      .withFaceLandmarks(true)
      .withFaceDescriptors();
    // .withFaceExpressions();
    console.log(
      '🚀 ~ file: face.service.ts:126 ~ FaceService ~ result:',
      result,
    );
    if (isRender || isRenderLandmark) {
      return this.drawFace(result, image, isRender, isRenderLandmark);
    } else {
      const items = result.map((o) => ({
        detection: {
          x: o.alignedRect.box.x,
          y: o.alignedRect.box.y,
          width: o.alignedRect.box.width,
          height: o.alignedRect.box.height,
          score: o.alignedRect.score,
        },
        encodings: Array.from(o.descriptor),
      }));
      return { count: result?.length, items };
    }
  }

  async landmark(
    imagePath: string,
    isRender: boolean,
    isRenderLandmark: boolean,
  ) {
    const image = await this.canvas.loadImage(imagePath);
    await this.removeFile(imagePath);

    const result = await faceapi
      .detectSingleFace(image, this.faceDetectorOptions)
      .withFaceLandmarks(true);
    if (isRender || isRenderLandmark) {
      return this.drawFace(result, image, isRender, isRenderLandmark);
    } else {
      return {
        detection: {
          x: result.alignedRect.box.x,
          y: result.alignedRect.box.y,
          width: result.alignedRect.box.width,
          height: result.alignedRect.box.height,
          score: result.alignedRect.score,
        },
        landmarks: Array.from(result.landmarks.positions).map((o) => ({
          x: o.x,
          y: o.y,
        })),
      };
    }
  }

  async landmarks(
    imagePath: string,
    isRender: boolean,
    isRenderLandmark: boolean,
  ) {
    const image = await this.canvas.loadImage(imagePath);
    await this.removeFile(imagePath);
    const result = await faceapi
      .detectAllFaces(image, this.faceDetectorOptions)
      .withFaceLandmarks(true);

    if (isRender || isRenderLandmark) {
      return this.drawFace(result, image, isRender, isRenderLandmark);
    } else {
      const items = result.map((data) => ({
        detection: {
          x: data.alignedRect.box.x,
          y: data.alignedRect.box.y,
          width: data.alignedRect.box.width,
          height: data.alignedRect.box.height,
          score: data.alignedRect.score,
        },
        landmarks: Array.from(data.landmarks.positions).map((position) => ({
          x: position.x,
          y: position.y,
        })),
      }));
      return { count: result?.length, items };
    }
  }
}
