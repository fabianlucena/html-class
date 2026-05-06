import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, '..'), 
      ],
    },
    host: true,
    port: 5173,
    https: {
      key: fs.readFileSync('./cert-key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    },
  }
});