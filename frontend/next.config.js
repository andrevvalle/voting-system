/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://backend:4000',
    PUBLIC_BACKEND_URL: process.env.PUBLIC_BACKEND_URL || 'http://localhost:4000',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000',
    JWT_SECRET: process.env.JWT_SECRET || 'voting-system-secret-key',
    VOTE_TOKEN_EXPIRY: process.env.VOTE_TOKEN_EXPIRY || '5m', // 5 minutos
  },
  
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

module.exports = nextConfig