import { ImageMagicNumberValidator } from './image-magic-number.validator';

function makeFile(buffer: Buffer, mimetype = 'image/png'): Express.Multer.File {
  return {
    buffer,
    mimetype,
    fieldname: 'file',
    originalname: 'test.png',
    encoding: '7bit',
    size: buffer.length,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };
}

// Real magic bytes
const PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const JPEG_BUFFER = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const WEBP_BUFFER = Buffer.from([
  0x52,
  0x49,
  0x46,
  0x46, // RIFF
  0x00,
  0x00,
  0x00,
  0x00, // file size (placeholder)
  0x57,
  0x45,
  0x42,
  0x50, // WEBP
]);
const FAKE_IMAGE_BUFFER = Buffer.from('this is not an image at all, just text');
const EXE_BUFFER = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]); // MZ header (PE/EXE)

describe('ImageMagicNumberValidator', () => {
  let validator: ImageMagicNumberValidator;

  beforeEach(() => {
    validator = new ImageMagicNumberValidator({});
  });

  it('accepts a valid PNG file', async () => {
    const file = makeFile(PNG_BUFFER, 'image/png');
    await expect(validator.transform(file)).resolves.toBe(file);
  });

  it('accepts a valid JPEG file', async () => {
    const file = makeFile(JPEG_BUFFER, 'image/jpeg');
    await expect(validator.transform(file)).resolves.toBe(file);
  });

  it('accepts a valid WebP file', async () => {
    const file = makeFile(WEBP_BUFFER, 'image/webp');
    await expect(validator.transform(file)).resolves.toBe(file);
  });

  it('rejects a file with text content but image MIME type', async () => {
    const file = makeFile(FAKE_IMAGE_BUFFER, 'image/png');
    await expect(validator.transform(file)).rejects.toThrow();
  });

  it('rejects an EXE file disguised as image/png', async () => {
    const file = makeFile(EXE_BUFFER, 'image/png');
    await expect(validator.transform(file)).rejects.toThrow();
  });

  it('rejects a buffer that is too small to contain a valid signature', async () => {
    const file = makeFile(Buffer.from([0x89, 0x50]), 'image/png');
    await expect(validator.transform(file)).rejects.toThrow();
  });
});
