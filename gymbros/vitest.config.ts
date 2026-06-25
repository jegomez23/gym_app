import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
      // Neutralize the server-only guard so Server Action helpers are testable.
      "server-only": new URL("./test/empty-module.ts", import.meta.url)
        .pathname,
    },
  },
});
