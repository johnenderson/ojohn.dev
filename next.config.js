const path = require('node:path');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
    rules: {
      '*.mdx': {
        condition: {
          query: /[?&]raw(?=&|$)/,
        },
        loaders: [path.resolve(__dirname, 'loaders/mdx-raw-loader.cjs')],
        as: '*.js',
      },
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'lastfm.freetls.fastly.net' },
      { protocol: 'https', hostname: 'i.scdn.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/github',
        destination: 'https://github.com/johnenderson',
        permanent: false,
      },
      {
        source: '/linkedin',
        destination: 'https://www.linkedin.com/in/john-enderson-8139bb2a',
        permanent: false,
      },
      {
        source: '/twitter',
        destination: 'https://twitter.com/johnenderson',
        permanent: false,
      },
    ];
  },
};
