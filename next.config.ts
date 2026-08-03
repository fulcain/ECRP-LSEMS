import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/email-templates",
        permanent: true,
      },
      {
        source: "/upcoming-course",
        destination: "/bls-formats?tab=upcoming-course",
        permanent: true,
      },
    ];
  },
  images: {
    domains: ["i.vgy.me", "i.ibb.co"],
  },
};

export default nextConfig;
