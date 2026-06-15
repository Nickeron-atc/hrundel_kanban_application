// vite.config.ts - Added proxy configuration to forward /api requests to Flask
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: '0.0.0.0',
        port: Number(process.env.PORT) || 5173,
        base: process.env.BASE_PATH || '/',
        // Forward all /api/* requests to the Flask backend running on port 5000
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
