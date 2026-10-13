import type { NextConfig } from "next";

const fxApiUrl = process.env.FX_API_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/fx-api/:path*",
        destination: `${fxApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
