import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      //'@hcc': 'https://cdn.jsdelivr.net/gh/fabianlucena/html-class/components',
      '@hcc': path.resolve(__dirname, '../../components'),
    }
  }
});