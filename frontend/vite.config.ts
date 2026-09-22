import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],

  resolve: {
    tsconfigPaths: true,
  },

  optimizeDeps: {
    entries: ['app/**/*.{ts,tsx}'],

    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
      'postprocessing',
      'motion',
      '@react-spring/three',
    ],
  },

  server: {
    warmup: {
      clientFiles: [
        './app/root.tsx',
        './app/components/Background.tsx',
        './app/routes/**/*.tsx',
      ],
    },

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
