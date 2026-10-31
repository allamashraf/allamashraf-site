// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/** @param {string} pkg @param {string} file */
const fontFile = (pkg, file) => `./node_modules/${pkg}/files/${file}`;

export default defineConfig({
  site: 'https://allamashraf.dev',
  output: 'static',
  trailingSlash: 'always',
  // Lets the test suite build an EMAIL_PUBLISHED=true variant next to dist/.
  outDir: process.env.ASTRO_OUT_DIR ?? './dist',
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
  },
  markdown: { syntaxHighlight: false },
  vite: {
    build: { sourcemap: false },
  },
  integrations: [
    // Drafts exist only in review builds (npm run dev / npm run build), never in build:prod,
    // so not a single draft byte reaches dist/ in production.
    {
      name: 'review-drafts',
      hooks: {
        'astro:config:setup': ({ injectRoute }) => {
          if (process.env.PUBLISH_MODE === 'prod') return;
          injectRoute({ pattern: '/draft/lead-field', entrypoint: './src/drafts/lead-field.astro' });
        },
      },
    },
    mdx(),
    // Drafts never appear in the sitemap (and are not built at all by build:prod).
    sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/draft/') }),
  ],
  env: {
    schema: {
      // 'prod' hides unpublishable claims; 'dev' shows them with an UNVERIFIED marker.
      PUBLISH_MODE: envField.enum({ context: 'server', access: 'public', values: ['dev', 'prod'], default: 'dev' }),
      // Flip to true only after the allam@ forwarding test passes (docs/DNS_PLAN.md).
      EMAIL_PUBLISHED: envField.boolean({ context: 'server', access: 'public', default: false }),
      // Kill-switch (§8.2): 'css' swaps the GSAP Signal Path for a CSS scroll-driven version.
      MOTION_ENGINE: envField.enum({ context: 'server', access: 'public', values: ['gsap', 'css'], default: 'gsap' }),
    },
  },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ],
    },
  },
  fonts: [
    {
      name: 'Space Grotesk',
      cssVariable: '--font-display',
      provider: fontProviders.local(),
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: [fontFile('@fontsource-variable/space-grotesk', 'space-grotesk-latin-wght-normal.woff2')],
            weight: '500 700',
            style: 'normal',
          },
        ],
      },
    },
    {
      name: 'Inter',
      cssVariable: '--font-body',
      provider: fontProviders.local(),
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: [fontFile('@fontsource-variable/inter', 'inter-latin-wght-normal.woff2')],
            weight: '400 600',
            style: 'normal',
          },
        ],
      },
    },
    {
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      provider: fontProviders.local(),
      fallbacks: ['monospace'],
      options: {
        variants: [
          {
            src: [fontFile('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff2')],
            weight: '500',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
