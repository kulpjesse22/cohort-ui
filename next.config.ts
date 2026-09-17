import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/context/[channelId]": ["./Agents/**/*"],
    "/api/doc": ["./Agents/**/*", "./Human/**/*"],
  },
};

export default nextConfig;
