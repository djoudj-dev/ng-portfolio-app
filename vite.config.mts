/// <reference types="vitest" />

import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [angular()],
    resolve: {
      alias: {
        '@shared': resolve(__dirname, './src/app/shared'),
        '@core': resolve(__dirname, './src/app/core'),
        '@features': resolve(__dirname, './src/app/features'),
        '@environments': resolve(__dirname, './src/environments'),
        '@assets': resolve(__dirname, './src/assets'),
        // Ajoute d'autres alias selon ta structure
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['**/*.spec.ts'],
      reporters: ['default'],
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
