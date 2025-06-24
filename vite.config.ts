import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
  },
  resolve: {
    alias: {
      '@features': path.resolve(__dirname, 'src/features'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@': path.resolve(__dirname, 'src/'),
    },
  },
});