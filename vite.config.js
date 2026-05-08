import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/iss-now': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/astros': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/reverse': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/gnews': {
        target: 'https://gnews.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gnews/, '/api/v4/top-headlines'),
      },
    },
  },
});
