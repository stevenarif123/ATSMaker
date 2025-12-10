/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for deployment as static files
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Set base path for deployment in subfolder (only for production)
  // For local development, access at http://localhost:3000/atsmaker
  // For Hostinger deployment in /atsmaker folder
  basePath: '/atsmaker',
};

export default nextConfig;