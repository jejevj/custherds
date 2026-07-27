const nextConfig = {
  allowedDevOrigins: [
    'partners.custherds.ourtestcloud.my.id',
    'https://partners.custherds.com',
    '172.17.0.1',
    'localhost',
  ],

  /**
   * Proxy semua request /api/v1/* ke backend api.custherds.com
   * dari sisi server (Node.js), bukan dari browser.
   * Ini menghilangkan CORS error karena request tidak lagi cross-origin.
   */
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.custherds.com/api/v1/:path*',
      },
    ]
  },
}

module.exports = nextConfig
