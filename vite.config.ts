/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/', // Explicit SPA base path
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core vendor chunks - order matters for preload
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor-react';
            if (id.includes('node_modules/react-router-dom')) return 'vendor-react-router';
            if (id.includes('node_modules/@tanstack/react-query')) return 'vendor-react-query';
            if (id.includes('node_modules/@supabase/supabase-js')) return 'vendor-supabase';
            if (id.includes('node_modules/recharts')) return 'vendor-recharts';
            if (id.includes('node_modules/lucide-react')) return 'vendor-lucide';
            if (id.includes('node_modules/zustand')) return 'vendor-zustand';
            if (id.includes('node_modules/date-fns')) return 'vendor-date-fns';
            if (id.includes('node_modules/react-hook-form')) return 'vendor-forms';
          }
        }
      }
    },
    // Ensure chunk names are stable for long-term caching
    chunkSizeWarningLimit: 500,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/components/ui/**',
        'src/types/**',
        'src/assets/**',
        'src/router/**',
        'src/main.tsx',
        'src/index.ts',
        'src/index.css',
        'vite-env.d.ts'
      ],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    retry: 2,
    maxConcurrency: 5,
    pool: 'forks',
    singleFork: true,
    sequence: {
      shuffle: false
    }
  }
});