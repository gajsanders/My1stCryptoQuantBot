/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['assets.coingecko.com'],
  },
  env: {
    BINANCE_CACHE_DURATION: '300000',      // 5 minutes
    SENTIMENT_CACHE_DURATION: '1800000',   // 30 minutes
    ANALYSIS_CACHE_DURATION: '900000',     // 15 minutes
    BINANCE_RATE_LIMIT: '1200',           // requests per minute
    OPENAI_RATE_LIMIT: '3',               // requests per minute
  },
}

module.exports = nextConfig 