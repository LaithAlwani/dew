import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Workspace packages ship raw TS/TSX — Next must transpile them.
  transpilePackages: ["@dew/ui", "@dew/auth"],
  // Serwist PWA wrapper is added in Phase 5.
};

export default withBundleAnalyzer(nextConfig);
