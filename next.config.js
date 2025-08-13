/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now the default in Next.js 14
  experimental: {
    // Enable optimizations for production
    optimizePackageImports: ["lucide-react"],
  },
  // Optimize images for production
  images: {
    formats: ["image/webp", "image/avif"],
  },
  // Enable compression
  compress: true,
};

module.exports = nextConfig;
