import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { seoContentInjector } from './scripts/seo-content-injector.js';

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: 'src/partials'
    }),
    // SEO: Inject English translations into built HTML for crawlers
    seoContentInjector()
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        blog: 'blog.html'
      }
    }
  },
  root: '.',
  publicDir: 'public'
});