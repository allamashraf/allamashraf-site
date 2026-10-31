// Build the progressive-enhancement entry separately so Astro never emits eager
// modulepreload links. Uses the Vite version already supplied by Astro.
import { build } from 'vite';
import { resolve } from 'node:path';

await build({
  configFile: false,
  publicDir: false,
  base: '/client/',
  build: {
    outDir: 'public/client',
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    lib: { entry: resolve('src/scripts/client.ts'), formats: ['es'], fileName: () => 'client.js' },
    rolldownOptions: { output: { chunkFileNames: '[name]-[hash].js' } },
  },
});
