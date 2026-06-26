import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock-cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock-secret',
});

export async function uploadImage(fileUri, folder = 'zassports-cricket') {
  // If credentials are not set, return a mock URL for testing
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME === 'mock-cloud'
  ) {
    console.log('Using mock Cloudinary upload');
    return {
      secure_url: fileUri.startsWith('data:') 
        ? 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600' // mock fallback
        : fileUri,
      public_id: 'mock_id_' + Date.now(),
    };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      fileUri,
      {
        folder: folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
}

export default cloudinary;
