# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Amjad Abujamous built with Vite and Handlebars. The site is bilingual (English/Arabic) with RTL support, dark/light theme switching, and comprehensive SEO optimization.

## Build & Development Commands

```bash
# Start development server (opens at http://localhost:3000)
npm run dev

# Build for production (clears dist/ and builds)
npm run build

# Preview production build
npm run preview
```

## Architecture

### Component System

The application uses **Handlebars partials** for templating. The HTML structure is assembled at build time:

- **Entry point**: `index.html` - contains Handlebars template tags like `{{> sidebar}}` and structured data for SEO
- **Partials directory**: `src/partials/` - contains `.hbs` files for each section:
  - `sidebar.hbs` - desktop navigation
  - `mobile-nav.hbs` - mobile hamburger menu
  - `bottom-nav.hbs` - bottom navigation bar
  - `home.hbs`, `about.hbs`, `education.hbs`, `projects.hbs`, `skills.hbs`, `contact.hbs` - content sections

All partials are configured in `vite.config.js` via `vite-plugin-handlebars`.

### JavaScript Module System

Entry point is `src/main.js` which imports modules in this specific order:

1. `css/style.css` - all styles (single CSS file)
2. `js/state.js` - global state management (AppState class)
3. `js/i18n.js` - internationalization system
4. `js/theme.js` - theme switching (ThemeManager class)
5. `js/main.js` - DOM interactions (navigation, smooth scrolling, intersection observer)

**Important**: All modules initialize via `DOMContentLoaded` event listeners.

### State Management

The application uses a custom reactive state system via `AppState` class in `src/js/state.js`:

- **Global instance**: `window.appState` - accessible throughout the application
- **Pattern**: Observer pattern with subscribe/notify methods
- **Responsibilities**:
  - Language switching (EN/AR)
  - Translation loading from `/public/i18n/{language}.json`
  - RTL/LTR direction switching
  - LocalStorage persistence for language preference

```javascript
// Example usage
await window.appState.changeLanguage('ar');
const translation = window.appState.t('sections.home.title');
```

### Internationalization (i18n)

Translation files are in `public/i18n/`:
- `en.json` - English translations
- `ar.json` - Arabic translations

HTML elements use `data-i18n` attributes for automatic translation:

```html
<h1 data-i18n="sections.home.title">Welcome</h1>
```

The i18n system in `src/js/i18n.js`:
- Automatically updates all `[data-i18n]` elements when language changes
- Handles special cases: meta tags, input placeholders, anchor hrefs
- Language switcher buttons are dynamically injected into sidebar and mobile nav

### Theme System

Dark/light theme managed by `ThemeManager` class in `src/js/theme.js`:

- **Storage**: `localStorage.getItem('theme')`
- **Detection**: Falls back to `prefers-color-scheme` media query
- **Implementation**: `data-theme` attribute on `<html>` element
- **UI**: Theme toggle buttons in both desktop sidebar and mobile nav

CSS variables in `src/css/style.css` respond to `[data-theme="dark"]` and `[data-theme="light"]`.

### Navigation & Interaction

Navigation is handled in `src/js/main.js`:

- **Smooth scrolling**: All `.nav-link` and `.bottom-nav-item` elements scroll to anchor targets
- **Mobile menu**: Burger menu toggles `.mobile-nav-panel` with animated hamburger icon
- **Scroll effects**: IntersectionObserver adds fade-in animation to sections on scroll
- **Auto-close**: Mobile nav closes after link click

## Working with Content

### Adding/Editing Sections

1. Edit the corresponding `.hbs` file in `src/partials/`
2. Add translations to both `public/i18n/en.json` and `public/i18n/ar.json`
3. Use `data-i18n="key.path"` attributes for translatable text

### Styling

All styles are in the single file `src/css/style.css`:
- Uses CSS custom properties for theming
- Responsive breakpoints for mobile/tablet/desktop
- RTL support via `[dir="rtl"]` selectors

### SEO & Metadata

The `index.html` contains:
- Open Graph meta tags
- Twitter Card meta tags
- JSON-LD structured data (Person and WebSite schemas)
- Comprehensive meta tags for keywords, description, etc.

When updating personal information, update both the HTML meta tags and the structured data scripts.

## Public Assets

- `public/` directory contains static assets (images, icons, i18n files)
- Favicon files generated from programming language icon (credit to Frans Wahyu)
- Assets are copied as-is during build

## Git Workflow

The project uses a simple Git workflow:
- Main branch: `master`
- Production deployment: builds from `dist/` directory
- Site is hosted on Netlify at https://glorious73.netlify.app/
