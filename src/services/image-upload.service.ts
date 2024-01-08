// image-upload.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class ImageUploadService {
  async uploadImageFromUrl(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const tmpPath = path.join(__dirname, '..', 'tmp'); // Adjust the path accordingly
    const fileName = `${Date.now()}_image.jpg`;
    const filePath = path.join(tmpPath, fileName);

    await fs.ensureDir(tmpPath);
    await fs.writeFile(filePath, Buffer.from(response.data, 'binary'));

    return filePath;
  }
}
