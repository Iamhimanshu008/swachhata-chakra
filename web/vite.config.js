import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // Vercel deployment fix for top-level await
    build: {
        target: 'esnext'
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://backend:8000',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://backend:8000',
                changeOrigin: true,
            },
        },
    },
});