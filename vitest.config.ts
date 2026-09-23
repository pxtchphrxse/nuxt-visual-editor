import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts'],
          environment: 'happy-dom',
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.spec.ts'],
          environment: 'node',
          fileParallelism: false,
          testTimeout: 120_000,
          hookTimeout: 600_000,
        },
      },
      {
        test: {
          name: 'smoke',
          include: ['test/smoke/**/*.test.ts'],
          environment: 'node',
          fileParallelism: false,
          testTimeout: 1_800_000,
          hookTimeout: 1_800_000,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: [
        'src/runtime/core/**/*.ts',
        'src/runtime/sanitize.ts',
        'src/runtime/server/init-sanitizer.ts',
        'build/content-css.ts',
      ],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
})
