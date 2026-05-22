/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
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
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
