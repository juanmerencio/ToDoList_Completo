import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O proxy envia /api/* para o backend Fastify (porta 3333), evitando CORS em desenvolvimento.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3333' } },
});
