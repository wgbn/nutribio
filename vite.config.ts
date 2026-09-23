import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

// GitHub Pages serves the project under a subpath (https://<user>.github.io/<repo>/).
// Local dev and root deployments use '/'. The CI workflow sets BASE_PATH, e.g. '/nutribio/'.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Nutribio',
        short_name: 'Nutribio',
        description:
          'Planos alimentares semanais personalizados a partir da tua bioimpedância, com o teu objetivo em foco.',
        lang: 'pt-PT',
        theme_color: '#059669',
        background_color: '#f6f8f7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          {src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png'},
          {src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png'},
          {
            src: `${base}icons/maskable-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['nbio.loca.lt'],
  },
});
