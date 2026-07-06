import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@dew/ui", "@dew/auth"],
};

export default nextConfig;
