import path from 'path';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: '/',

  plugins: [
    
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),

    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(__dirname, '..'),
            }),
          ),
        ]
      : []),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  root: __dirname,

  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },

  // server: {
  //   port: 5173,
  //   strictPort: true,
  //   host: '0.0.0.0',
  //   allowedHosts: true,

  //   fs: {
  //     strict: true,
  //   },
  // },
  server: {
  port: 5173,
  strictPort: true,
  host: '0.0.0.0',
  allowedHosts: true,

  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },

  fs: {
    strict: true,
  },
},

  preview: {
    port: 4173,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});