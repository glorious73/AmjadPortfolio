# AGENTS.md

This file provides coding guidelines for agentic coding tools working in this repository.

## Project Overview

Personal website for Amjad Abujamous, Software Engineer & Tech Enthusiast. Built with Vite + Handlebars, bilingual (English/Arabic) with RTL support, dark/light theme switching, and comprehensive SEO optimization.

## Build & Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build locally
```

**No testing framework configured** - This project has no test commands. When adding tests, set up a testing framework (e.g., Vitest, Jest) and update this file.

**No linting/formatting tools** - This project has no ESLint, Prettier, or similar tools configured.

## Architecture Notes

**Entry Points:** `index.html` (main site), `blog.html` (blog listing). Both use Handlebars partials from `src/partials/`.

**JavaScript Module Order (src/main.js):**
1. `css/style.css` - all styles
2. `js/state.js` - global AppState
3. `js/i18n.js` - internationalization
4. `js/theme.js` - ThemeManager
5. `js/main.js` - DOM interactions
6. `js/accordion.js` - mobile accordion
7. `js/blog.js` - blog UI
8. `js/contact.js` - contact form

**Blog Backend:** Google Apps Script with Google Sheets data store (see BLOG_SETUP.md for configuration).

**Build Plugins:** SEO Content Injector (injects English translations for crawlers), Netlify config copy.

## Code Style Guidelines

### JavaScript/TypeScript

**Imports:**
- Use ES module syntax with explicit file extensions: `import { blogApi } from './blogApi.js'`
- Import dependencies first, then local modules (see `src/main.js`)
- Export singleton instances directly: `export const blogApi = new BlogAPI()`

**Classes & Patterns:**
- Use ES6 classes for feature modules (AppState, ThemeManager, Contact, BlogManager, BlogAPI)
- Apply singleton pattern for single instances: `static getInstance()` with private instance property
- Use observer pattern for state changes: `subscribe(listener)` and `notify()` methods
- Initialize modules via `DOMContentLoaded` event listeners

**Functions:**
- Use arrow functions for callbacks and event handlers
- Use async/await for async operations
- Prefix internal/private methods with underscore or keep them as class methods

**Comments:**
- Add JSDoc comments for public methods with parameter and return types (see `src/js/blogApi.js`)
- **DO NOT add comments** unless explicitly requested

**Error Handling:**
- Use try-catch blocks for async operations
- Log errors with `console.error()` for debugging
- Return meaningful error messages or data
- Implement graceful fallbacks (e.g., flag SVGs fallback to text in `i18n.js`)

**State Management:**
- Use global `window.appState` instance for reactive state
- Access translations via `window.appState.t('key.path')` supporting nested keys
- Subscribe to state changes with `window.appState.subscribe(callback)`
- Translation files located at `public/i18n/en.json` and `public/i18n/ar.json`

### CSS

**Single File:** All styles in `src/css/style.css` - do not create additional CSS files

**Theming:**
- Use CSS custom properties (variables) for colors, spacing, etc.
- Define light theme in `:root`, dark theme in `[data-theme="dark"]`
- Access theme variables with `var(--variable-name)`

**Naming:**
- Use kebab-case for class names: `.sidebar-content`, `.language-switcher`
- Use semantic, descriptive names that reflect purpose

**Typography:**
- Primary font: `'Expo Arabic', Arial, sans-serif`
- Use `font-weight: 600` (SemiBold) for headings, NOT `700` (Bold)

**RTL Support:**
- Use `[dir="rtl"]` selectors for RTL-specific styles
- Test both LTR and layouts for Arabic support

### HTML/Handlebars

**Internationalization:**
- Add `data-i18n="key.path"` attributes to all translatable elements
- i18n system handles: inputs/textarea (placeholder), meta tags (content), anchors (href for email/phone, text for social), other elements (textContent)

**Accessibility:**
- Include ARIA attributes for interactive elements: `aria-expanded`, `aria-hidden`, `aria-busy`
- Ensure keyboard navigation works (Escape key to close modals, etc.)

**SEO:**
- `index.html` contains Open Graph, Twitter Cards, and JSON-LD structured data
- When updating personal info, update both meta tags and structured data

**Structure:**
- Use Handlebars partials in `src/partials/` for reusable components
- Keep HTML semantic and well-structured

### File Naming

- JavaScript: `camelCase.js` (e.g., `blogApi.js`, `main.js`)
- Handlebars partials: `kebab-case.hbs` (e.g., `blog-post.hbs`, `contact-form.hbs`)
- Classes: PascalCase (e.g., `AppState`, `ThemeManager`)

### Build Plugins

- Custom Vite plugins in `vite.config.js` follow standard plugin API
- Use `name` property for plugin identification
- Use `closeBundle` hook for post-build operations
- Log plugin actions with `[plugin-name]` prefix

### API Patterns

- Use `fetch()` API for HTTP requests
- Check `response.ok` before parsing JSON
- Return structured responses with success/error indicators
- API base URLs as constants at module top (see `src/js/blogApi.js`)

### Constants

- Use UPPER_SNAKE_CASE for constant values at module level
- Group related constants together

### General Principles

- Keep code modular and focused on single responsibility
- Follow existing patterns in the codebase
- Prefer simplicity over clever solutions
- Ensure RTL compatibility for all new features
