# Blog Images Setup

Blog post hero images need to be stored locally in `public/images/blog/` for proper display in social media cards.

## Current Blog Posts

| Post Title | Expected Filename |
|------------|------------------|
| Claude is awesome | claude-is-awesome.jpg |
| Take your productivity to the next level | take-your-productivity-to-the-next-level.jpg |
| كتاب لكل موظف وكل إداري | kitab-li-kull-mowathif-wa-kull-idari.jpg |

## Instructions

### 1. Download Images
Download the hero images from your Google Drive and save them to `public/images/blog/` with the filenames listed above.

### 2. Recommended Image Specs
- **Size**: 1200x630px (optimal for Twitter and Facebook OG cards)
- **Format**: JPG (good compression for web)
- **File size**: Under 1MB if possible
- **Naming**: Use the exact filenames listed above

### 3. After Adding Images
Run `npm run build` to regenerate blog post HTML files. The build will automatically use the new local image paths.

## How It Works

1. **Build time**: `scripts/blog-metadata-generator.js` generates individual HTML files for each blog post
   - Uses local image paths: `/images/blog/{filename}`
   - Sets `og:image` and `twitter:image` meta tags correctly

2. **Runtime**: `src/js/blog.js` handles blog post rendering
   - `getLocalImagePath(slug)` maps slugs to local image filenames
   - Falls back to Google Drive URL if local image not found
   - Hero image displays via CSS background from local path

## Troubleshooting

**Hero image not displaying?**
- Verify image filename matches exactly (case-sensitive)
- Check browser console for 404 errors on image path
- Ensure image exists in `public/images/blog/`

**OG card still shows no image?**
- Clear social media platform cache and test the URL again
- Use Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Use Twitter Card Validator: https://cards-dev.twitter.com/validator

**Social buttons show wrong image?**
- Social buttons intentionally use Google Drive thumbnail URLs
- This ensures original image quality is preserved in shares
