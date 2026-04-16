import { Injectable, Logger } from '@nestjs/common';
import { IStorageProvider } from './storage.provider.interface';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private client: S3Client;
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('STORAGE_BUCKET');
    this.publicUrl =
      this.configService.getOrThrow<string>('STORAGE_PUBLIC_URL');

    const endpoint = this.configService.get<string>('STORAGE_ENDPOINT');

    this.client = new S3Client({
      region: this.configService.get<string>('STORAGE_REGION') || 'auto',
      endpoint: endpoint, // Used for R2 or custom S3 compatible services
      credentials: {
        accessKeyId:
          this.configService.getOrThrow<string>('STORAGE_ACCESS_KEY'),
        secretAccessKey:
          this.configService.getOrThrow<string>('STORAGE_SECRET_KEY'),
      },
    });
  }

  async upload(
    file: Buffer,
    fileName: string,
    mimeType: string,
    path: string = '',
  ): Promise<string> {
    const uniqueFileName = `${randomUUID()}${extname(fileName)}`;
    const key = path ? `${path}/${uniqueFileName}` : uniqueFileName;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    });

    try {
      await this.client.send(command);
      // Cloudflare R2 / S3 Public Bucket URLs usually look like this:
      // return `${this.publicUrl}/${key}`;
      // Let's make sure there's no double slash
      const baseUrl = this.publicUrl.endsWith('/')
        ? this.publicUrl.slice(0, -1)
        : this.publicUrl;
      return `${baseUrl}/${key}`;
    } catch (error) {
      this.logger.error(`Error uploading file to S3/R2. Key: ${key}`, error);
      throw new Error('Could not upload file to storage');
    }
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      // Extract the key from the public URL
      const url = new URL(fileUrl);
      const key = url.pathname.substring(1); // remove leading slash

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      this.logger.error(
        `Error deleting file from S3/R2. Url: ${fileUrl}`,
        error,
      );
      // We usually don't throw on delete to avoid blocking operations, just log
    }
  }
}
