import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('html5-qrcode') || id.includes('qrcode')) {
              return 'vendor-qr';
            }
            if (id.includes('axios')) {
              return 'vendor-network';
            }
            return 'vendor-misc';
          }
        }
      }
    }
  }
});
