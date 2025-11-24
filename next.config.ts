import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/cleverse/:path*',
        destination: 'https://hsi.cleverse.kr/:path*',
      },
      {
        source: '/hallucinations/:path*',
        destination: 'http://172.16.238.112:8000/api/:path*',
      },
      {
        source: '/chat/:path*',
        destination: 'http://172.16.10.209:8001/api/:path*',
      },
    ]
  },
}

export default nextConfig
