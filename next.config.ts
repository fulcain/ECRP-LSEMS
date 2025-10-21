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
  images: {
    domains: ["i.imgur.com"],
  },
};

export default nextConfig;
