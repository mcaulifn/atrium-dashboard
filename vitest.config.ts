import { defineConfig } from "vitest/config";

export default defineConfig({
  // strategy.ts reads a build-time constant; give it a value under test.
  define: { __ATRIUM_VERSION__: JSON.stringify("test") },
  // jsdom gives components a window (nav reads window.location).
  test: { environment: "jsdom" },
});
