import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import { JSDOM } from 'jsdom';

function readFile(path, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzvBWE07omolFyrO7rA-zDjifaRRKCvCnI-3ikjdxn1FA0mFhddW-pddQ0L4NptUsAObQ/exec';

async function fetchPosts() {
  const url = new URL(API_BASE_URL);
  url.searchParams.append('mode', 'api');
  url.searchParams.append('content', 'true');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch posts');
  }

  return data;
}

/**
 * Vite plugin to generate individual blog post HTML files
 * with dynamic metadata for social media sharing
 */
export function blogMetadataGenerator() {
  return {
    name: 'blog-metadata-generator',
    apply: 'build',
    closeBundle: async () => {
      console.log('\n[Blog Metadata Generator] Starting blog post generation...');

      try {
        const data = await fetchPosts();

        if (!data.posts || data.posts.length === 0) {
          console.log('[Blog Metadata Generator] No posts found, skipping generation.');
          return;
        }

        const distPath = path.resolve(process.cwd(), 'dist');
        const blogDir = path.join(distPath, 'blog');
        const blogTemplatePath = path.join(distPath, 'blog.html');

        await fsExtra.ensureDir(blogDir);

        let generatedCount = 0;

        for (const post of data.posts) {
          const slug = post.slug;
          const fileName = `post-${slug}.html`;
          const filePath = path.join(blogDir, fileName);
          const postUrl = `https://iamamjad.com/blog/${slug}`;

          const html = await generateBlogPostHtml(post, postUrl, blogTemplatePath);

          await fsExtra.writeFile(filePath, html, 'utf-8');
          generatedCount++;

          const relativePath = path.relative(process.cwd(), filePath);
          console.log(`  [Blog] ${relativePath}: "${post.title}"`);
        }

        console.log(`[Blog Metadata Generator] Generated ${generatedCount} blog post files.\n`);
      } catch (error) {
        console.error('[Blog Metadata Generator] Error:', error.message);
        console.warn('[Blog Metadata Generator] Skipping blog post generation due to error.');
      }
    }
  };
}

async function generateBlogPostHtml(post, postUrl, templatePath) {
  const title = post.title || 'Untitled Post';
  const excerpt = post.excerpt || post.metaDescription || '';
  const description = excerpt.length > 160 ? excerpt.substring(0, 157) + '...' : excerpt;
  const updatedAt = post.updatedAt || post.date;
  const imageUrl = post.image ? getImageUrl(post.image, 1200) : 'https://iamamjad.com/profile/amjad%20profile%20pic.png';
  const localImagePath = post.image ? getLocalImagePath(post.slug, post.lang) : '/profile/amjad profile pic.png';
  const dir = (post.lang && post.lang === 'ar') ? 'rtl' : 'ltr';
  const lang = post.lang || 'en';

  const templateHtml = await readFile(templatePath, 'utf-8');
  const dom = new JSDOM(templateHtml);
  const document = dom.window.document;

  const titleEl = document.querySelector('title');
  if (titleEl) {
    titleEl.removeAttribute('data-i18n');
    titleEl.textContent = `Amjad Abujamous - ${escapeHtml(title)}`;
  }

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', escapeHtml(description));

  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) metaKeywords.setAttribute('content', `Amjad Abujamous, software engineer, blog, ${escapeHtml(title)}`);

  const localeEl = document.querySelector('meta[property="locale"]');
  const localeAltEl = document.querySelector('meta[property="locale:alternate"]');
  if (localeEl) localeEl.setAttribute('content', lang === 'ar' ? 'ar_SA' : 'en_US');
  if (localeAltEl) localeAltEl.setAttribute('content', lang === 'ar' ? 'en_US' : 'ar_SA');

  const ogUrlEl = document.querySelector('meta[property="og:url"]');
  if (ogUrlEl) ogUrlEl.setAttribute('content', postUrl);

  const ogTitleEl = document.querySelector('meta[property="og:title"]');
  if (ogTitleEl) ogTitleEl.setAttribute('content', `Amjad Abujamous - ${escapeHtml(title)}`);

  const ogDescEl = document.querySelector('meta[property="og:description"]');
  if (ogDescEl) ogDescEl.setAttribute('content', escapeHtml(description));

  const ogImageEl = document.querySelector('meta[property="og:image"]');
  if (ogImageEl) ogImageEl.setAttribute('content', localImagePath);

  const twitterUrlEl = document.querySelector('meta[property="twitter:url"]');
  if (twitterUrlEl) twitterUrlEl.setAttribute('content', postUrl);

  const twitterTitleEl = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitleEl) twitterTitleEl.setAttribute('content', `Amjad Abujamous - ${escapeHtml(title)}`);

  const twitterDescEl = document.querySelector('meta[property="twitter:description"]');
  if (twitterDescEl) twitterDescEl.setAttribute('content', escapeHtml(description));

  const twitterImageEl = document.querySelector('meta[property="twitter:image"]');
  if (twitterImageEl) twitterImageEl.setAttribute('content', localImagePath);

  const canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) canonicalEl.setAttribute('href', postUrl);

  const existingVersionMeta = document.querySelector('meta[name="post-version"]');
  if (existingVersionMeta) existingVersionMeta.remove();

  const head = document.querySelector('head');
  const versionMeta = document.createElement('meta');
  versionMeta.setAttribute('name', 'post-version');
  versionMeta.setAttribute('content', updatedAt);
  head.appendChild(versionMeta);

  const blogPostContent = document.getElementById('blogPostContent');
  if (blogPostContent) {
    blogPostContent.setAttribute('dir', dir);
    blogPostContent.setAttribute('data-post-slug', post.slug);
    blogPostContent.setAttribute('data-post-version', updatedAt);

    const postContentEl = document.getElementById('postContent');
    if (postContentEl) {
      const postDataDiv = document.createElement('div');
      postDataDiv.className = 'post-data';
      postDataDiv.style.display = 'none';

      const scriptTag = document.createElement('script');
      scriptTag.type = 'application/json';
      scriptTag.textContent = JSON.stringify(post);

      postDataDiv.appendChild(scriptTag);
      postContentEl.appendChild(postDataDiv);
    }
  }

  return dom.serialize();
}

function getImageUrl(image, size) {
  if (!image) return null;

  if (image.driveId) {
    return `https://drive.google.com/thumbnail?id=${image.driveId}&sz=s${size}`;
  }

  return image.url || null;
}

function getLocalImagePath(slug, lang) {
  const imageFilenames = {
    'claude-is-awesome': 'claude-is-awesome.jpg',
    'take-your-productivity-to-the-next-level': 'take-your-productivity-to-the-next-level.jpg',
    'كتاب-لكل-موظف-وكل-إداري': 'kitab-li-kull-mowathif-wa-kull-idari.jpg'
  };

  const filename = imageFilenames[slug];
  if (filename) {
    return `/images/blog/${filename}`;
  }

  return null;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
