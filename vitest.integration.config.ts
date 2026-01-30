import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Integration test configuration - uses real Supabase connection
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/integration/setup.ts"],
    include: ["src/test/integration/**/*.integration.test.{ts,tsx}"],
    // Longer timeout for integration tests
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
