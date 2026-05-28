/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.sureverifications.com',
      },
    ],
  },
}

module.exports = nextConfig
