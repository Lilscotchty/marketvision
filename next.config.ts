// Force Vercel rebuild: Env Vars Refresh
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // ... (leave the rest of your code alone)
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lnpyhrogsrpywoftosbg.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.benzinga.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
