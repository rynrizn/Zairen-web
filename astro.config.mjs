// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static', // Generación estática para páginas públicas, con opción de islas dinámicas
  integrations: [
    react({
      include: ['**/components/**/*.tsx', '**/stores/**/*.ts']
    })
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  }
});
