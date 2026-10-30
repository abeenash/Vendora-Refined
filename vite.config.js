import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            //every file passed to @vite() in app.blade.php must be listed, or production builds 500
            input: ['resources/js/App.jsx', 'resources/css/app.css'],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    server: {
        port: 5180,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, 'resources/js'),
        }
    },
});
