/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for deployment as static files
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Set base path for deployment in subfolder
  basePath: '/atsmaker',
};

export default nextConfig;