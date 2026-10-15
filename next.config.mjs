/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remotion and WebCodecs configuration
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

export default nextConfig;
