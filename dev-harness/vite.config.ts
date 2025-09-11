import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 3000,
    hmr: {
      port: 3002,  // Separate HMR port to avoid conflicts
    },
    watch: {
      // Ignore files that shouldn't trigger rebuilds
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/applications/**',  // Don't watch application files
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});