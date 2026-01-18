# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website for Amjad Abujamous, Software Engineer & Tech Enthusiast, built with Vite and Handlebars. The site is bilingual (English/Arabic) with RTL support, dark/light theme switching, and comprehensive SEO optimization.

## Build & Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build
```

## Architecture

### Entry Points

Two HTML pages configured in `vite.config.js`:
- `index.html` - main site with Handlebars partials and JSON-LD structured data
- `blog.html` - blog listing page

### Component System

Uses **Handlebars partials** in `src/partials/` assembled at build time. Partials include navigation (`sidebar.hbs`, `mobile-nav.hbs`, `bottom-nav.hbs`) and content sections (`home.hbs`, `about.hbs`, etc.).

### JavaScript Module System

Entry point `src/main.js` imports modules in order:
1. `css/style.css` - all styles (single file)
2. `js/state.js` - global state (AppState class)
3. `js/i18n.js` - internationalization
4. `js/theme.js` - theme switching (ThemeManager class)
5. `js/main.js` - DOM interactions
6. `js/blogApi.js` - blog API service (Google Apps Script backend)
7. `js/blog.js` - blog UI rendering and filtering

All modules initialize via `DOMContentLoaded` event listeners.

### State Management

Custom reactive state via `AppState` class (`src/js/state.js`):
- **Global instance**: `window.appState`
- **Pattern**: Observer pattern with subscribe/notify
- Handles language switching, translation loading, RTL/LTR, localStorage persistence

```javascript
await window.appState.changeLanguage('ar');
const translation = window.appState.t('sections.home.title');
```

### Internationalization (i18n)

Translation files in `public/i18n/`: `en.json` and `ar.json`

HTML elements use `data-i18n` attributes:
```html
<h1 data-i18n="sections.home.title">Welcome</h1>
```

The i18n system handles different element types:
- `<input>`/`<textarea>`: sets `placeholder`
- `<meta>`: sets `content`
- `<a>` with `.contact-email`: sets `href` to `mailto:` + translation
- `<a>` with `.contact-phone`: sets `href` to `tel:` + translation
- `<a>` social links (`.contact-linkedin`, `.contact-github`, etc.): only updates text, keeps original `href`
- All other elements: sets `textContent`

### Theme System

`ThemeManager` class (`src/js/theme.js`) manages dark/light theme:
- Uses `localStorage` with `prefers-color-scheme` fallback
- Sets `data-theme` attribute on `<html>`
- CSS variables in `style.css` respond to `[data-theme="dark"]` and `[data-theme="light"]`

### Blog System

The blog uses a Google Apps Script backend with Google Sheets as the data store:
- `src/js/blogApi.js` - API client (`BlogAPI` class) for fetching posts
- `src/js/blog.js` - UI rendering, filtering by language/tag
- `blog.html` - Single post view page (uses `?slug=` query param)
- See `BLOG_SETUP.md` for backend configuration

### Build Plugins

Custom Vite plugins in the build:
- **SEO Content Injector** (`scripts/seo-content-injector.js`): Injects English translations into built HTML for search engine crawlers
- **Netlify Config Copy**: Copies `netlify.toml` to `dist/` after build

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

`index.html` contains Open Graph, Twitter Cards, and JSON-LD structured data (Person and WebSite schemas). When updating personal info, update both meta tags and structured data.

## Deployment

- Main branch: `master`
- Hosted on Netlify at https://iamamjad.com/
- Build output: `dist/` directory
