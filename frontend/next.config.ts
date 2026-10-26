import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    // On Vercel the backend is a separate deployment. Proxying /api through this site keeps the
    // login cookie first-party (set NEXT_PUBLIC_API_URL to this site and BACKEND_PROXY_URL to the backend).
    const backendProxy = process.env.BACKEND_PROXY_URL;
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${backendProxy || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/:path*`,
      },
      ...(backendProxy ? [{ source: "/api/:path*", destination: `${backendProxy}/api/:path*` }] : []),
    ];
  },
};

export default nextConfig;
