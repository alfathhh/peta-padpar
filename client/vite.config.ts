/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const portApi = process.env.VITE_API_PROXY_TARGET || 'http://localhost:3001';

export default defineConfig({
  // @ts-expect-error vitest config
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
  },
  plugins: [
    react(),
    // Treat .geojson files as JSON so Rollup bundles them inline
    {
      name: 'geojson',
      transform(code, id) {
        if (!id.endsWith('.geojson')) return null;
        return { code: `export default ${code}`, map: null };
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: portApi,
        changeOrigin: true,
      },
      '/uploads': {
        target: portApi,
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
