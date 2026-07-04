/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Only the hosts this store actually serves images from: Cloudinary
    // (product/category uploads) and Unsplash (seed + banner fallbacks).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
