import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    proxy: {
      // Redirect all API requests to the backend
      '/api': `http://backend:${process.env.BACKEND_PORT}`,

      // Proxy Socket.IO connections to the backend.
      '/socket.io': {
        target: `http://backend:${process.env.BACKEND_PORT}`,
        ws: true,
      },
    },
  },
});
