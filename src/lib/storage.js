import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 data URI to Cloudinary.
 * Returns the public URL and a unique file ID.
 */
export async function uploadImage(dataUri, folder = 'zassports-cricket') {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: folder,
    resource_type: 'auto',
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}

export default { uploadImage };
