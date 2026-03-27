import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    crx({ manifest }),
  ],
  base: './',
  build: {
    rollupOptions: {
      input: {
        'side-panel': resolve(__dirname, 'src/side-panel/side-panel.html'),
      },
    },
  },
});
