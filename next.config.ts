import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 't.me' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.telegram.org' },
      { protocol: 'https', hostname: 'cdn*.telesco.pe' },
    ],
  },
};

export default nextConfig;
