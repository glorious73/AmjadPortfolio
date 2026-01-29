#!/usr/bin/env node

import fs from 'fs/promises';
import fsExtra from 'fs-extra';
import path from 'path';

const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzvBWE07omolFyrO7rA-zDjifaRRKCvCnI-3ikjdxn1FA0mFhddW-pddQ0L4NptUsAObQ/exec';

async function fetchPosts() {
  const url = new URL(API_BASE_URL);
  url.searchParams.append('mode', 'api');
  url.searchParams.append('content', 'false');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch posts');
  }

  return data.posts || [];
}

async function downloadImage(url, filename) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = path.join(process.cwd(), 'public', 'images', 'blog', filename);

  await fsExtra.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, buffer);

  console.log(`  Downloaded: ${filename}`);
}

function getImageFilename(post) {
  const filenames = {
    'claude-is-awesome': 'claude-is-awesome.jpg',
    'take-your-productivity-to-the-next-level': 'take-your-productivity-to-the-next-level.jpg',
    'كتاب-لكل-موظف-وكل-إداري': 'kitab-li-kull-mowathif-wa-kull-idari.jpg',
    'take-your-productivity-to-the-next-level': 'take-your-productivity-to-the-next-level.jpg',
    'a-few-beliefs-i-had-at-21-that-didnt-survive-reality': 'a-few-beliefs-i-had-at-21-that-didnt-survive-reality.jpg'
  };

  return filenames[post.slug] || null;
}

function generateFilenameFromSlug(slug) {
  return `${slug}.jpg`;
}

function addFilenameMapping(post) {
  const filename = generateFilenameFromSlug(post.slug);
  console.log(`  Suggested filename mapping for new post:`);
  console.log(`    '${post.slug}': '${filename}'`);
  return filename;
}

async function main() {
  console.log('\n[Blog Image Downloader] Starting...\n');

  try {
    const posts = await fetchPosts();

    if (posts.length === 0) {
      console.log('[Blog Image Downloader] No posts found.');
      return;
    }

    console.log(`[Blog Image Downloader] Found ${posts.length} posts.\n`);

    let downloadedCount = 0;
    let skippedCount = 0;

    const postsWithoutMapping = [];
    
    for (const post of posts) {
      if (!post.image || !post.image.driveId) {
        skippedCount++;
        continue;
      }

      const hasMapping = !!getImageFilename(post);
      if (!hasMapping) {
        postsWithoutMapping.push(post);
      }

      let filename = getImageFilename(post);

      if (!filename) {
        filename = addFilenameMapping(post);
        console.log(`  Add this mapping to the getImageFilename function to auto-download in future runs.`);
        // Still download the image even without explicit mapping
      }

      const imageUrl = `https://lh3.googleusercontent.com/d/${post.image.driveId}=s1200`;

      try {
        await downloadImage(imageUrl, filename);
        downloadedCount++;
      } catch (error) {
        console.log(`  Failed to download ${filename}:`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n[Blog Image Downloader] Complete!`);
    console.log(`  Downloaded: ${downloadedCount} images`);
    console.log(`  Skipped: ${skippedCount} posts`);
    console.log(`  Images saved to: public/images/blog/\n`);

    if (postsWithoutMapping.length > 0) {
      console.log(`\n[Blog Image Downloader] New posts detected without filename mappings:`);
      postsWithoutMapping.forEach(post => {
        const filename = generateFilenameFromSlug(post.slug);
        console.log(`    '${post.slug}': '${filename}',`);
      });
      console.log(`\nAdd these mappings to the getImageFilename function to streamline future downloads.`);
    }

    if (downloadedCount > 0) {
      console.log('\n[Blog Image Downloader] Success! Run "npm run build" to regenerate blog HTML files.\n');
    } else {
      console.log('\n[Blog Image Downloader] Warning: No images were downloaded.\n');
    }
  } catch (error) {
    console.error('\n[Blog Image Downloader] Error:', error.message);
    process.exit(1);
  }
}

main();
