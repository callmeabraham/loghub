import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/chat": ["./lib/knowledge/**/*.md"],
  },
};

export default nextConfig;
