import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],

  resolve: {
    tsconfigPaths: true,
  },

  optimizeDeps: {
    entries: [
      'app/**/*.{ts,tsx}',
    ],

    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
      'postprocessing',
      'leva',
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
      '/api': `http://backend:${process.env.BACKEND_PORT}`,

      '/socket.io': {
        target: `http://backend:${process.env.BACKEND_PORT}`,
        ws: true,
      },
    },
  },
});