# Blog Setup Guide

This guide will help you configure the blog functionality for your portfolio website.

## Prerequisites

You should have already deployed your Google Apps Script blog backend. If not, please deploy it first and note the deployment ID.

## Configuration Steps

### 1. Update the API Base URL

Open [src/js/blogApi.js](src/js/blogApi.js) and replace `YOUR_DEPLOYMENT_ID` with your actual Google Apps Script deployment ID:

```javascript
const API_BASE_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

For example:
```javascript
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbxxx.../exec';
```

### 2. Test the Blog Locally

Run the development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000` and scroll down to the Blog section. You should see:
- Language filter tabs (All, English, Arabic)
- Tag filters (dynamically generated from your posts)
- Blog post cards with title, excerpt, tags, and date
- Posts filtered by language and tags

### 3. Test Single Post View

Click on any blog post card to navigate to the single post view at `/blog.html?slug=your-post-slug`.

The single post page should display:
- Post title with language badge
- Publication date
- Tags
- Full HTML content from your Quill.js editor
- "Originally published on" banner (if applicable)
- "Back to Blog" button

### 4. RTL Support for Arabic Posts

Arabic posts automatically display with:
- Right-to-left text direction (`dir="rtl"`)
- Proper alignment for headings, paragraphs, and lists
- Reversed flex directions for meta information
- Right-aligned blockquotes and borders

### 5. Build for Production

When ready to deploy:

```bash
npm run build
```

This will create optimized builds for both `index.html` and `blog.html` in the `dist` folder.

## Features Implemented

### Blog Listing Page (index.html#blog)

- ✅ Language filter tabs (All, English, Arabic)
- ✅ Dynamic tag filtering
- ✅ Responsive grid layout
- ✅ Post cards with title, excerpt, tags, and date
- ✅ Loading and error states
- ✅ "No posts found" message
- ✅ "Originally published" indicator for republished posts
- ✅ Hover effects and animations
- ✅ Links to individual posts using slugs

### Single Post Page (blog.html)

- ✅ Full post content with HTML rendering
- ✅ Post metadata (title, date, tags, language)
- ✅ RTL support for Arabic posts
- ✅ Original source attribution (if applicable)
- ✅ "Last updated" timestamp
- ✅ Back to blog navigation
- ✅ Loading and error states
- ✅ Dynamic page title and meta description

### API Integration

- ✅ Fetch all posts with filtering options
- ✅ Fetch single post by slug
- ✅ Exclude content for list views (performance optimization)
- ✅ Error handling with retry functionality

### Internationalization (i18n)

- ✅ English translations
- ✅ Arabic translations
- ✅ Language switcher integration
- ✅ RTL support for Arabic interface

### Responsive Design

- ✅ Mobile-friendly layout
- ✅ Tablet optimization
- ✅ Desktop grid layout
- ✅ Bottom navigation support

## API Endpoints Reference

Your Google Apps Script backend should support these endpoints:

### List All Posts
```
?mode=api
```

### Filter by Language
```
?mode=api&lang=en
?mode=api&lang=ar
```

### Filter by Tag
```
?mode=api&tag=tech
```

### Limit Results
```
?mode=api&limit=5
```

### Exclude Content (for performance)
```
?mode=api&content=false
```

### Get Single Post by Slug
```
?mode=api&slug=my-post-slug
```

### Combine Parameters
```
?mode=api&lang=en&tag=tech&limit=10&content=false
```

## Troubleshooting

### Posts not loading
1. Check that you've updated the `API_BASE_URL` in `src/js/blogApi.js`
2. Open browser DevTools Console and check for errors
3. Verify your Google Apps Script is deployed and accessible
4. Test the API endpoint directly in your browser

### RTL not working for Arabic posts
1. Ensure posts in your Google Sheet have `lang: "ar"`
2. Check that the `dir` attribute is being set on post elements
3. Verify CSS RTL styles are loaded

### Styles not appearing
1. Make sure `src/css/style.css` is imported in `src/main.js`
2. Run `npm run dev` and check for CSS errors in console
3. Clear browser cache

## Next Steps

1. Replace `YOUR_DEPLOYMENT_ID` in [src/js/blogApi.js](src/js/blogApi.js)
2. Test locally with `npm run dev`
3. Add some blog posts to your Google Sheet
4. Build for production with `npm run build`
5. Deploy the `dist` folder to your hosting service

## Additional Customization

### Change Accent Color
Edit the CSS variables in [src/css/style.css](src/css/style.css):

```css
:root {
  --accent-color: #667eea; /* Change this */
}
```

### Modify Post Card Layout
Edit the `createPostCard` method in [src/js/blog.js](src/js/blog.js)

### Add More Filter Options
Extend the filter buttons in [src/partials/blog.hbs](src/partials/blog.hbs)

### Customize Post Rendering
Modify the `renderPost` method in [src/js/blog.js](src/js/blog.js)

## Support

If you encounter any issues, check:
1. Browser console for JavaScript errors
2. Network tab for API request/response issues
3. Google Apps Script logs for backend errors
