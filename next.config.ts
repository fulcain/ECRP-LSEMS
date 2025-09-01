import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/", 
		destination: "/email-templates", 
        permanent: true, 
      },
    ];
  },
};

export default nextConfig;
