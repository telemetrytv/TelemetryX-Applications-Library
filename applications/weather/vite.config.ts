import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        render: resolve(__dirname, 'src/render.html'),
        settings: resolve(__dirname, 'src/settings.html')
      },
      output: {
        entryFileNames: '[name]/index.js',
        chunkFileNames: '[name]/[name].js',
        assetFileNames: '[name]/[name].[ext]'
      }
    }
  },
  server: {
    port: 3001,
    open: false
  }
});