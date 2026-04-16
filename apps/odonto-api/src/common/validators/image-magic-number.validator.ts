import { FileValidator, BadRequestException } from '@nestjs/common';

/**
 * Validates that the uploaded file's binary content matches a known image
 * signature (PNG, JPEG, or WebP), preventing MIME-type spoofing attacks
 * where an attacker sets Content-Type: image/png on a non-image file.
 */
export class ImageMagicNumberValidator extends FileValidator {
  async isValid(file?: Express.Multer.File): Promise<boolean> {
    if (!file?.buffer || file.buffer.length < 4) return false;
    return this.hasValidSignature(file.buffer);
  }

  buildErrorMessage(): string {
    return 'Invalid image file. File content does not match a supported image format (PNG, JPEG, WebP).';
  }

  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    const valid = await this.isValid(file);
    if (!valid) {
      throw new BadRequestException(this.buildErrorMessage());
    }
    return file;
  }

  private hasValidSignature(buffer: Buffer): boolean {
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return true;
    }

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return true;
    }

    // WebP: RIFF????WEBP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return true;
    }

    return false;
  }
}
