import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Saves a base64 data URI to the local public/uploads directory.
 * Returns the public URL path and a unique file ID.
 */
export async function uploadImage(dataUri, folder = 'zassports-cricket') {
  ensureUploadDir();

  // Generate a unique filename
  const ext = dataUri.split(';')[0]?.split('/')[1] || 'png';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const filename = `${folder}_${timestamp}_${random}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Extract base64 data (remove "data:image/png;base64," prefix)
  const base64Data = dataUri.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  fs.writeFileSync(filepath, buffer);

  return {
    secure_url: `/uploads/${filename}`,
    public_id: filename,
  };
}

export default { uploadImage };
