import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';
import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';
import { seoContentInjector } from './scripts/seo-content-injector.js';

// Cross-platform plugin to copy netlify.toml to dist
function copyNetlifyConfig() {
  return {
    name: 'copy-netlify-config',
    closeBundle() {
      try {
        copyFileSync(
          resolve(process.cwd(), 'netlify.toml'),
          resolve(process.cwd(), 'dist', 'netlify.toml')
        );
        console.log('[copy-netlify-config] Copied netlify.toml to dist/');
      } catch (err) {
        console.warn('[copy-netlify-config] Could not copy netlify.toml:', err.message);
      }
    }
  };
}

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: 'src/partials'
    }),
    // SEO: Inject English translations into built HTML for crawlers
    seoContentInjector(),
    // Copy netlify.toml after build (cross-platform)
    copyNetlifyConfig()
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        blog: 'blog.html',
        contact: 'contact.html'
      }
    }
  },
  root: '.',
  publicDir: 'public'
});