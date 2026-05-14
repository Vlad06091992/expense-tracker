/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/shared-types'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
