import { defineConfig } from 'vite';

import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/constants/**',
        'src/interfaces/**',
        '**/*.spec.ts',
        '**/*.test.ts'
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90
      }
    }
  },
  build: {
    lib: {
      entry: 'src/sunbird-epub-player.ts',
      formats: ['es', 'umd'],
      name: 'SunbirdEpubPlayer',
      fileName: (format) => `sunbird-epub-player.${format}.js`
    },
    rollupOptions: {
      external: ['lit', 'epubjs', '@project-sunbird/telemetry-sdk']
    }
  }
});
