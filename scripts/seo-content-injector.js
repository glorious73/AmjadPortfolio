import fs from 'fs-extra';
import path from 'path';
import { JSDOM } from 'jsdom';

/**
 * Vite plugin to inject English translations into built HTML files
 * for SEO purposes. Crawlers will see English content by default,
 * while JavaScript will replace content based on user's language preference at runtime.
 */
export function seoContentInjector() {
  return {
    name: 'seo-content-injector',
    apply: 'build',
    closeBundle: async () => {
      console.log('\n[SEO Content Injector] Starting content injection...');

      try {
        // Read English translations
        const translationsPath = path.resolve(process.cwd(), 'public/i18n/en.json');
        const translations = JSON.parse(await fs.readFile(translationsPath, 'utf-8'));

        // Flatten nested translations for easy lookup
        const flatTranslations = flattenObject(translations);

        // Find all HTML files in dist
        const distPath = path.resolve(process.cwd(), 'dist');
        const htmlFiles = await findHtmlFiles(distPath);

        console.log(`[SEO Content Injector] Found ${htmlFiles.length} HTML files`);

        let totalInjections = 0;

        for (const htmlFile of htmlFiles) {
          const injections = await injectContent(htmlFile, flatTranslations);
          totalInjections += injections;
        }

        console.log(`[SEO Content Injector] Complete! Injected content into ${totalInjections} elements.\n`);
      } catch (error) {
        console.error('[SEO Content Injector] Error:', error.message);
      }
    }
  };
}

/**
 * Flattens a nested object into dot-notation keys
 * e.g., { blog: { title: "Blog" } } => { "blog.title": "Blog" }
 */
function flattenObject(obj, prefix = '') {
  const result = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }

  return result;
}

/**
 * Recursively finds all HTML files in a directory
 */
async function findHtmlFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await findHtmlFiles(fullPath));
    } else if (item.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Injects English translations into elements with data-i18n attributes
 */
async function injectContent(htmlFile, translations) {
  const html = await fs.readFile(htmlFile, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  let injectionCount = 0;

  // Find all elements with data-i18n attribute (the portfolio uses data-i18n, not data-text)
  const elements = document.querySelectorAll('[data-i18n]');

  for (const element of elements) {
    const key = element.getAttribute('data-i18n');
    const translation = translations[key];

    if (translation && typeof translation === 'string') {
      const currentContent = element.innerHTML.trim();
      // Inject if empty or placeholder
      if (!currentContent || currentContent === key || currentContent.length < 3) {
        // Handle special elements
        if (element.tagName === 'META') {
          element.setAttribute('content', translation);
        } else {
          element.innerHTML = translation;
        }
        injectionCount++;
      }
    }
  }

  // Handle placeholder attributes for form inputs
  const inputElements = document.querySelectorAll('input[data-i18n], textarea[data-i18n]');
  for (const element of inputElements) {
    const key = element.getAttribute('data-i18n');
    const translation = translations[key];

    if (translation && typeof translation === 'string' && !element.getAttribute('placeholder')) {
      element.setAttribute('placeholder', translation);
      injectionCount++;
    }
  }

  if (injectionCount > 0) {
    await fs.writeFile(htmlFile, dom.serialize());
    const relativePath = path.relative(process.cwd(), htmlFile);
    console.log(`  [SEO] ${relativePath}: ${injectionCount} injections`);
  }

  return injectionCount;
}
