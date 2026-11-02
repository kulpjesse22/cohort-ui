import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/context/[channelId]": ["./Agents/**/*"],
    "/api/doc": ["./Agents/**/*", "./Human/**/*"],
    "/reviews": ["./Agents/handoffs/**/*"],
    "/reviews/[id]": ["./Agents/handoffs/**/*"],
  },
};

export default nextConfig;
