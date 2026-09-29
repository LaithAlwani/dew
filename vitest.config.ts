import { defineConfig } from "vitest/config";

// convex-test runs functions against a mock Convex backend in the edge runtime.
export default defineConfig({
  test: {
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
    include: ["convex/**/*.test.ts"],
  },
});
