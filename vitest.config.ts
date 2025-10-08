import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    env: {
      // Load .env.test file for integration tests
      NODE_ENV: 'test'
    },
    exclude: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '**/components_backup/**',
      '**/hooks_backup/**',
      '**/lib_backup/**',
      '**/pages_backup/**',
      '**/services_backup/**',
      'backend/node_modules/**',
      'supabase/node_modules/**',
      'tests/environmental/**' // Exclude environmental tests from main test runs
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
          include: [
            'src/**/*.{ts,tsx}',
            'backend/services/**/*.{ts,js}' // Only include testable service files
          ],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/vite-env.d.ts',
        '**/index.tsx',
        '**/main.tsx',
        'tests/**/*',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/components_backup/**/*',
        '**/hooks_backup/**/*',
        '**/lib_backup/**/*',
        '**/pages_backup/**/*',
        '**/services_backup/**/*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
});
