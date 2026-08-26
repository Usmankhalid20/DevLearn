import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@devlearn/types', '@devlearn/ui'],
};

export default nextConfig;
