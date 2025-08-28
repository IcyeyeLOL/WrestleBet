/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for Netlify
  trailingSlash: false,
  // Ensure proper image handling
  images: {
    unoptimized: true,
  },
  // Disable static optimization for dynamic rendering
  experimental: {
    // Disable static page generation
    workerThreads: false,
  },
};

export default nextConfig;
