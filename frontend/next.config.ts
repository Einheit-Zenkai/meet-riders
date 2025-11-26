import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: ["@meet-riders/shared"],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'hpzuzgccyusizsgvfhmr.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
};

export default nextConfig;

