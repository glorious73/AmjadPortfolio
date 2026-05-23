# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for Amjad Abujamous, built with Vite and Handlebars. Bilingual (English/Arabic) with RTL support, dark/light theme switching, and SEO optimization. Hosted on Netlify at https://iamamjad.com/.

## Build & Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Downloads blog images from Google Drive, then runs vite build (outputs to dist/)
npm run preview  # Preview production build
```

Note: `npm run build` first executes `scripts/download-blog-images.js` (fetches blog post images from Google Drive) before running `vite build`. The build requires network access to the Google Apps Script API.

## Architecture

### Entry Points

Three HTML pages configured in `vite.config.js`, each using Handlebars partials:
- `index.html` — main single-page site with all sections, JSON-LD structured data
- `blog.html` — blog post view page (uses `?slug=` query param)
- `contact.html` — standalone contact form page

All three pages share the same entry point `src/main.js` and the same navigation partials (sidebar, mobile-nav, bottom-nav).

### JavaScript Module System

Entry point `src/main.js` imports modules in this order:
1. `css/style.css` — all styles (single file)
2. `js/state.js` — global state (`AppState` class, exposed as `window.appState`)
3. `js/i18n.js` — internationalization (applies translations from `data-i18n` attributes)
4. `js/theme.js` — theme switching (`ThemeManager` class)
5. `js/main.js` — DOM interactions, navigation, section visibility
6. `js/accordion.js` — mobile accordion system (`MobileAccordion`, exposed as `window.mobileAccordion`)
7. `js/blog.js` — blog UI rendering, filtering (imports `js/blogApi.js` internally)
8. `js/contact.js` — contact form submission with bot detection

All modules initialize via `DOMContentLoaded` event listeners. Modules that need cross-module communication use `window.appState.subscribe()`.

### State Management

Custom reactive state via `AppState` class (`src/js/state.js`):
- **Global instance**: `window.appState`
- **Pattern**: Observer pattern with subscribe/notify
- Handles language switching, translation loading, RTL/LTR direction, localStorage persistence

```javascript
await window.appState.changeLanguage('ar');
const translation = window.appState.t('sections.home.title');
```

### Internationalization (i18n)

Translation files: `public/i18n/en.json` and `public/i18n/ar.json`

HTML elements use `data-i18n` attributes for translatable text:
```html
<h1 data-i18n="sections.home.title">Welcome</h1>
```

The i18n system handles different element types:
- `<input>`/`<textarea>`: sets `placeholder`
- `<meta>`: sets `content`
- `<a>` with `.contact-email`: sets `href` to `mailto:` + translation
- `<a>` social links (`.contact-linkedin`, `.contact-github`, etc.): only updates text, keeps original `href`
- All other elements: sets `textContent`

### Theme System

`ThemeManager` class (`src/js/theme.js`):
- Uses `localStorage` with `prefers-color-scheme` fallback
- Sets `data-theme` attribute on `<html>`
- CSS variables in `style.css` respond to `[data-theme="dark"]` and `[data-theme="light"]`

### Blog System

Google Apps Script backend with Google Sheets as data store:
- `src/js/blogApi.js` — API client (`BlogAPI` class) for fetching posts
- `src/js/blog.js` — UI rendering, filtering by language/tag
- `blog.html` — single post view page (uses `?slug=` query param)
- See `BLOG_SETUP.md` for backend configuration

### Build Plugins (vite.config.js)

Three custom Vite plugins run during build:
1. **SEO Content Injector** (`scripts/seo-content-injector.js`): Injects English translations into built HTML for search engine crawlers
2. **Blog Metadata Generator** (`scripts/blog-metadata-generator.js`): Fetches all blog posts from the API and generates individual HTML files at `dist/blog/post-{slug}.html` with proper Open Graph/Twitter Card metadata for social sharing
3. **Netlify Config Copy**: Copies `netlify.toml` to `dist/` after build

### Netlify Routing

`netlify.toml` maps clean blog URLs (`/blog/:slug`) to pre-rendered files (`/blog/post-:slug.html`). Section URLs like `/about`, `/projects` redirect to hash routes on `index.html`.

## Working with Content

### Adding/Editing Sections

1. Edit the `.hbs` file in `src/partials/`
2. Add translations to both `public/i18n/en.json` and `public/i18n/ar.json`
3. Use `data-i18n="key.path"` attributes for translatable text

### Styling

Single file `src/css/style.css`:
- CSS custom properties for theming
- Responsive breakpoints
- RTL support via `[dir="rtl"]` selectors

### SEO & Metadata

`index.html` contains Open Graph, Twitter Cards, and JSON-LD structured data (Person and WebSite schemas). When updating personal info, update both meta tags and structured data. Blog posts get individual metadata via the Blog Metadata Generator build plugin.

## Deployment

- Main branch: `master`
- Build output: `dist/` directory
- Deployed on Netlify