import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from './prisma';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const EXTENSIONS_BY_MIME_TYPE = {
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export class UploadValidationError extends Error {}

function getStorageDirectory() {
  const configuredDirectory = process.env.STORAGE_DIR?.trim();

  if (process.env.NODE_ENV === 'production' && !configuredDirectory) {
    throw new Error(
      'STORAGE_DIR is required in production and must point to the persistent Hostinger public_html/uploads directory.'
    );
  }

  if (process.env.NODE_ENV === 'production' && !path.isAbsolute(configuredDirectory)) {
    throw new Error('STORAGE_DIR must be an absolute path in production.');
  }

  return configuredDirectory
    ? path.resolve(configuredDirectory)
    : path.resolve(process.cwd(), 'storage', 'uploads');
}

function getImageExtension(file) {
  const expectedExtension = EXTENSIONS_BY_MIME_TYPE[file.type];
  if (!expectedExtension) {
    throw new UploadValidationError('Invalid file type. Allowed types: JPEG, PNG, WebP, and GIF.');
  }

  const originalExtension = path.extname(file.name || '').toLowerCase();
  if (file.type === 'image/jpeg' && ['.jpg', '.jpeg'].includes(originalExtension)) {
    return originalExtension;
  }

  return originalExtension === expectedExtension ? originalExtension : expectedExtension;
}

function hasValidImageSignature(buffer, mimeType) {
  if (mimeType === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === 'image/png') {
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    return buffer.length >= pngSignature.length
      && buffer.subarray(0, pngSignature.length).equals(pngSignature);
  }

  if (mimeType === 'image/gif') {
    const signature = buffer.subarray(0, 6).toString('ascii');
    return signature === 'GIF87a' || signature === 'GIF89a';
  }

  if (mimeType === 'image/webp') {
    return buffer.length >= 12
      && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
      && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }

  return false;
}

export async function uploadImage(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new UploadValidationError('No valid image file was provided.');
  }

  if (!file.size) {
    throw new UploadValidationError('The uploaded image is empty.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new UploadValidationError('File size exceeds the 5MB limit.');
  }

  const extension = getImageExtension(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length > MAX_IMAGE_SIZE) {
    throw new UploadValidationError('File size exceeds the 5MB limit.');
  }

  if (!hasValidImageSignature(buffer, file.type)) {
    throw new UploadValidationError('The uploaded file does not contain a valid image.');
  }

  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
  const storageDirectory = getStorageDirectory();
  const filePath = path.join(storageDirectory, filename);

  await fs.mkdir(storageDirectory, { recursive: true });
  await fs.writeFile(filePath, buffer, { flag: 'wx' });

  return {
    secure_url: `/uploads/${filename}`,
    public_id: filename,
  };
}

export async function deleteImage(url) {
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return;

  const filename = url.slice('/uploads/'.length);
  if (!filename || filename !== path.basename(filename)) return;

  try {
    const [banner, category, orderItem, product] = await Promise.all([
      prisma.banner.findFirst({ where: { image: url }, select: { id: true } }),
      prisma.category.findFirst({ where: { image: url }, select: { id: true } }),
      prisma.orderItem.findFirst({ where: { image: url }, select: { id: true } }),
      prisma.product.findFirst({
        where: { images: { array_contains: url } },
        select: { id: true },
      }),
    ]);

    if (banner || category || orderItem || product) return;

    const storageDirectory = getStorageDirectory();
    const filePath = path.resolve(storageDirectory, filename);
    if (path.dirname(filePath) !== storageDirectory) return;

    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Failed to delete uploaded image ${url}:`, error);
    }
  }
}
