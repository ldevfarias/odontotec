import { Injectable, Logger } from '@nestjs/common';
import { IStorageProvider } from './storage.provider.interface';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { extname } from 'path';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl =
      this.configService.get<string>('API_URL') || 'http://localhost:3000';

    // Ensure base upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folderPath: string = '',
  ): Promise<string> {
    const uniqueFileName = `${randomUUID()}${extname(fileName)}`;
    const relativePath = folderPath
      ? path.join(folderPath, uniqueFileName)
      : uniqueFileName;
    const fullPath = path.join(this.uploadDir, relativePath);

    // Ensure subdirectories exist
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      await fs.promises.writeFile(fullPath, file);
      // Return URL like http://localhost:3000/uploads/folder/file.pdf
      const urlPath = folderPath
        ? `${folderPath}/${uniqueFileName}`
        : uniqueFileName;
      return `${this.baseUrl}/uploads/${urlPath}`;
    } catch (error) {
      this.logger.error(`Error saving file locally. Path: ${fullPath}`, error);
      throw new Error('Could not save file locally');
    }
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      // Extract the relative path from the URL
      // Example: http://localhost:3000/uploads/exams/123.pdf -> exams/123.pdf
      if (!fileUrl.includes('/uploads/')) return;

      const urlParts = fileUrl.split('/uploads/');
      if (urlParts.length < 2) return;

      const relativePath = urlParts[1];
      const fullPath = path.join(this.uploadDir, relativePath);

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (error) {
      this.logger.error(`Error deleting local file. Url: ${fileUrl}`, error);
    }
  }
}
