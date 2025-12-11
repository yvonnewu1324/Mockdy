import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // Proxy Notion API requests to bypass CORS in local dev.
          // In production on Vercel, the `/api/notion` route is backed by a serverless function.
          '/api/notion': {
            target: 'https://api.notion.com/v1',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/notion/, ''),
            headers: {
              'Notion-Version': '2022-06-28',
            },
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
