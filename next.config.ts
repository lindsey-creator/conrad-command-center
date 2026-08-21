import type { NextConfig } from 'next';

const pages = process.env.GITHUB_PAGES === '1';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(pages
    ? {
        output: 'export' as const,
        basePath: '/conrad-command-center',
        assetPrefix: '/conrad-command-center',
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
