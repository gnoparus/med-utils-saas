import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest configuration for the MedUtils project.
 *
 * Key choices:
 * - `environment: 'jsdom'` so we can test React components with JSDOM.
 * - `globals: true` to allow describe/it/expect without imports.
 * - `setupFiles` points to a test setup file (create `tests/setup.ts`) to register
 *   testing-library matchers and any global mocks.
 * - Coverage is configured with sensible defaults and a coverage gate you can adjust.
 * - Alias '@' -> '/src' so tests can import using '@/...' like the app code.
 *
 * Additions you'll likely want:
 * - `tests/setup.ts` that imports '@testing-library/jest-dom' and configures any globals.
 * - Install dev deps: vitest, @testing-library/react, @testing-library/jest-dom, jsdom
 */

export default defineConfig({
  test: {
    // Use JSDOM for React component testing
    environment: "jsdom",
    // Provide globals like `describe`, `it`, `expect` without imports
    globals: true,
    // Timeout for individual tests (ms)
    testTimeout: 5000,
    // Files to include as tests
    include: ["tests/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    // File that runs before the test suite (registers matchers, global mocks)
    setupFiles: ["tests/setup.ts"],
    // Enable watch mode heuristics less aggressively in CI
    watch: false,
    // Limit threads in some environments (set true if you want parallelism)
    threads: true,
    // Coverage configuration
    coverage: {
      provider: "v8", // or 'istanbul'
      reporter: ["text", "lcov"],
      // Include only source files (adjust to match your library folders)
      include: ["src/**/*.{ts,tsx}"],
      // Exclude entry points, generated files, and test helpers
      exclude: [
        "node_modules/",
        "src/main.tsx",
        "src/index.css",
        "src/**/*.d.ts",
        "tests/",
      ],
      all: true,
      // Suggested minimums; adjust as your project matures
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    // Force test output to be readable in CI
    reporters: process.env.CI ? "dot" : "default",
    // Pass dependencies that need to be transformed (if any)
    // deps: { inline: ['@testing-library/react'] },
  },

  // Vite resolution aliases so test and source imports match app code
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
