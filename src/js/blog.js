import { blogApi } from './blogApi.js';

class BlogManager {
  constructor() {
    this.currentFilter = 'all';
    this.currentTag = null;
    this.posts = [];
    this.allTags = new Set();
    this.postsPerPage = 6;
    this.currentPage = 0;
  }

  getLocalImagePath(slug) {
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

  /**
   * Normalize post data from API to expected format
   * API uses: categories, date, metaDescription
   * Expected: tags, publishedAt, excerpt, lang
   */
  normalizePost(post) {
    return {
      ...post,
      // Map categories to tags
      tags: post.tags || post.categories || [],
      // Map date to publishedAt
      publishedAt: post.publishedAt || post.date,
      // Map metaDescription to excerpt
      excerpt: post.excerpt || post.metaDescription || '',
      // Detect language from title or default to 'en'
      lang: post.lang || this.detectLanguage(post.title),
      // Keep updatedAt
      updatedAt: post.updatedAt || post.date
    };
  }

  /**
   * Detect if text is Arabic based on character range
   */
  detectLanguage(text) {
    if (!text) return 'en';
    // Check for Arabic characters
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text) ? 'ar' : 'en';
  }

  /**
   * Initialize blog on the index page (list view)
   */
  async initBlogList() {
    const blogSection = document.getElementById('blog');
    if (!blogSection) return;

    this.setupEventListeners();
    await this.loadPosts();
  }

  /**
   * Setup event listeners for filters
   */
  setupEventListeners() {
    // Language filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.getAttribute('data-filter');
        this.applyFilter(filter);

        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Retry button
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadPosts());
    }

    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMorePosts());
    }
  }

  /**
   * Load all posts
   */
  async loadPosts() {
    const loading = document.getElementById('blogLoading');
    const error = document.getElementById('blogError');
    const postsContainer = document.getElementById('blogPosts');

    try {
      loading.style.display = 'block';
      error.style.display = 'none';

      // Fetch all posts without content for list view
      const data = await blogApi.getPosts({ content: false });
      // Normalize posts to expected format
      this.posts = (data.posts || []).map(post => this.normalizePost(post));
      this.currentPage = 0;

      // Extract all unique tags
      this.extractTags();

      // Render initial posts
      this.renderPosts();
      this.renderTags();

      loading.style.display = 'none';
    } catch (err) {
      console.error('Failed to load posts:', err);
      loading.style.display = 'none';
      error.style.display = 'block';
    }
  }

  /**
   * Extract all unique tags from posts
   */
  extractTags() {
    this.allTags.clear();
    this.posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => this.allTags.add(tag));
      }
    });
  }

  /**
   * Render tag filters
   */
  renderTags() {
    const tagsContainer = document.getElementById('tagsContainer');
    if (!tagsContainer || this.allTags.size === 0) return;

    const tagsHTML = Array.from(this.allTags).map(tag =>
      `<button class="tag-btn" data-tag="${tag}">#${tag}</button>`
    ).join('');

    tagsContainer.innerHTML = tagsHTML;

    // Add click listeners to tag buttons
    tagsContainer.querySelectorAll('.tag-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tag = e.target.getAttribute('data-tag');
        this.toggleTag(tag, e.target);
      });
    });
  }

  /**
   * Toggle tag filter
   */
  toggleTag(tag, button) {
    if (this.currentTag === tag) {
      this.currentTag = null;
      button.classList.remove('active');
    } else {
      // Remove active from all tag buttons
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      this.currentTag = tag;
      button.classList.add('active');
    }

    this.currentPage = 0;
    this.renderPosts();
  }

  /**
   * Apply language filter
   */
  applyFilter(filter) {
    this.currentFilter = filter;
    this.currentPage = 0;
    this.renderPosts();
  }

  /**
   * Get filtered posts
   */
  getFilteredPosts() {
    let filtered = this.posts;

    // Apply language filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(post => post.lang === this.currentFilter);
    }

    // Apply tag filter
    if (this.currentTag) {
      filtered = filtered.filter(post =>
        post.tags && post.tags.includes(this.currentTag)
      );
    }

    return filtered;
  }

  /**
   * Render posts to the grid
   */
  renderPosts() {
    const postsContainer = document.getElementById('blogPosts');
    const noPosts = document.getElementById('noPosts');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    const filtered = this.getFilteredPosts();

    if (filtered.length === 0) {
      postsContainer.innerHTML = '';
      noPosts.style.display = 'block';
      if (loadMoreContainer) loadMoreContainer.style.display = 'none';
      return;
    }

    noPosts.style.display = 'none';

    // Get posts to display (paginated)
    const endIndex = (this.currentPage + 1) * this.postsPerPage;
    const postsToShow = filtered.slice(0, endIndex);

    // Render all posts up to current page
    const postsHTML = postsToShow.map(post => this.createPostCard(post)).join('');
    postsContainer.innerHTML = postsHTML;

    // Show/hide load more button
    this.updateLoadMoreButton(filtered.length, endIndex);
  }

  /**
   * Update load more button visibility
   */
  updateLoadMoreButton(totalPosts, displayedCount) {
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (!loadMoreContainer) return;

    if (displayedCount < totalPosts) {
      loadMoreContainer.style.display = 'flex';
    } else {
      loadMoreContainer.style.display = 'none';
    }
  }

  /**
   * Load more posts
   */
  loadMorePosts() {
    this.currentPage++;
    this.renderPosts();
  }

  /**
   * Create HTML for a post card
   */
  createPostCard(post) {
    const dir = post.lang === 'ar' ? 'rtl' : 'ltr';
    const tags = post.tags ? post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('') : '';
    const originalSource = post.originalSource ?
      `<div class="original-source">
        <span class="original-badge" data-i18n="blog.originallyPublished">Originally published</span>
        <a href="${post.originalSource.url}" target="_blank" rel="noopener noreferrer">
          ${new URL(post.originalSource.url).hostname}
        </a>
      </div>` : '';

    return `
      <article class="blog-card" dir="${dir}">
        <div class="blog-card-header">
          <h3 class="blog-card-title">
            <a href="/blog/${encodeURIComponent(post.slug)}">${this.escapeHtml(post.title)}</a>
          </h3>
          <span class="blog-card-lang">${post.lang.toUpperCase()}</span>
        </div>

        <p class="blog-card-excerpt">${this.escapeHtml(post.excerpt)}</p>

        ${originalSource}

        <div class="blog-card-footer">
          <div class="blog-card-tags">${tags}</div>
          <time class="blog-card-date" datetime="${post.publishedAt}">
            ${this.formatDate(post.publishedAt)}
          </time>
        </div>
      </article>
    `;
  }

  /**
   * Initialize single post view
   */
  async initBlogPost() {
    const postContainer = document.getElementById('blogPostContent');
    if (!postContainer) return;

    let slug;

    // Try clean URL format first: /blog/{slug}
    const pathSegments = window.location.pathname.split('/').filter(s => s);
    const blogIndex = pathSegments.indexOf('blog');

    if (blogIndex !== -1 && pathSegments[blogIndex + 1]) {
      // Clean URL format: /blog/{slug}
      slug = pathSegments[blogIndex + 1];
    } else {
      // Fallback to query parameter format: /blog.html?slug={slug}
      const urlParams = new URLSearchParams(window.location.search);
      slug = urlParams.get('slug');
    }

    if (!slug) {
      this.showPostError();
      return;
    }

    this.slug = slug;
    await this.loadPost(slug);
  }

  /**
   * Load single post
   */
  async loadPost(slug) {
    const loading = document.getElementById('postLoading');
    const error = document.getElementById('postError');
    const content = document.getElementById('postContent');

    try {
      loading.style.display = 'block';
      error.style.display = 'none';

      // Check if pre-rendered post data exists in HTML
      const postContainer = document.getElementById('blogPostContent');
      const postDataEl = postContainer?.querySelector('.post-data');
      let post = null;
      let isPreRendered = false;

      if (postDataEl) {
        try {
          const scriptTag = postDataEl.querySelector('script[type="application/json"]');
          if (scriptTag) {
            const preRenderedPost = JSON.parse(scriptTag.textContent);
            post = this.normalizePost(preRenderedPost);
            isPreRendered = true;
            console.log('[Blog] Using pre-rendered post data');
          }
        } catch (e) {
          console.warn('[Blog] Failed to parse pre-rendered data:', e);
        }
      }

      if (post) {
        // Render pre-rendered post immediately (fast)
        this.renderPost(post);
        loading.style.display = 'none';
        content.style.display = 'block';

        // Check content freshness in background
        if (isPreRendered) {
          setTimeout(() => this.checkContentFreshness(post), 100);
        }
      } else {
        // No pre-rendered data, fetch from API
        const rawPost = await blogApi.getPostBySlug(slug);
        post = this.normalizePost(rawPost);
        this.renderPost(post);
        loading.style.display = 'none';
        content.style.display = 'block';
      }
    } catch (err) {
      console.error('Failed to load post:', err);
      this.showPostError();
    }
  }

  /**
   * Check content freshness and update if needed
   */
  async checkContentFreshness(renderedPost) {
    try {
      // Get rendered version from meta tag
      const versionMeta = document.querySelector('meta[name="post-version"]');
      const renderedVersion = versionMeta?.content;

      if (!renderedVersion) {
        console.log('[Blog] No version metadata, skipping freshness check');
        return;
      }

      // Fetch current version from API
      const rawPost = await blogApi.getPostBySlug(this.slug);
      const currentPost = this.normalizePost(rawPost);
      const currentVersion = currentPost.updatedAt || currentPost.date;

      // Compare timestamps
      if (currentVersion > renderedVersion) {
        console.log('[Blog] Content updated, refreshing...');
        this.updatePostContent(currentPost);
      } else {
        console.log('[Blog] Content is up-to-date');
      }
    } catch (err) {
      console.warn('[Blog] Freshness check failed:', err);
    }
  }

  /**
   * Update post content with fresh data
   */
  updatePostContent(freshPost) {
    const post = this.normalizePost(freshPost);

    // Re-render post content
    this.renderPost(post);

    // Update meta tags with new timestamp
    const versionMeta = document.querySelector('meta[name="post-version"]');
    if (versionMeta) {
      versionMeta.setAttribute('content', post.updatedAt || post.date);
    }

    console.log('[Blog] Post content updated');
  }

  /**
   * Show post error
   */
  showPostError() {
    const loading = document.getElementById('postLoading');
    const error = document.getElementById('postError');
    const content = document.getElementById('postContent');

    loading.style.display = 'none';
    content.style.display = 'none';
    error.style.display = 'block';
  }

  /**
   * Render single post
   */
  renderPost(post) {
    const content = document.getElementById('postContent');
    const dir = post.lang === 'ar' ? 'rtl' : 'ltr';
    const tags = post.tags ? post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('') : '';

    // Get hero image URL (use large size for hero)
    // Prefer local image path for hero display, fallback to API URL
    const imageUrl = this.getLocalImagePath(post.slug, post.lang) || blogApi.getImageUrl(post.image, 1200);

    const originalSource = post.originalSource ?
      `<div class="original-source-banner">
        <p>
          <span data-i18n="blog.originallyPublishedOn">Originally published on</span>
          <a href="${post.originalSource.url}" target="_blank" rel="noopener noreferrer">
            ${new URL(post.originalSource.url).hostname}
          </a>
          <span data-i18n="blog.on">on</span> ${this.formatDate(post.originalSource.date)}
        </p>
      </div>` : '';

    // Hero header with image (Medium/Dev.to style)
    // Note: background-image URL is set via JavaScript after innerHTML to avoid & encoding issues
    const heroHeader = imageUrl ? `
      <header class="post-hero" dir="${dir}">
        <div class="post-hero-image" id="postHeroImage">
          <div class="post-hero-overlay">
            <div class="post-hero-content">
              <div class="post-meta">
                <span class="post-lang-badge">${post.lang.toUpperCase()}</span>
                <time class="post-date" datetime="${post.publishedAt}">
                  ${this.formatDate(post.publishedAt)}
                </time>
              </div>
              <h1 class="post-title">${this.escapeHtml(post.title)}</h1>
            </div>
          </div>
        </div>
      </header>
    ` : `
      <header class="post-header" dir="${dir}">
        <div class="post-meta">
          <span class="post-lang-badge">${post.lang.toUpperCase()}</span>
          <time class="post-date" datetime="${post.publishedAt}">
            ${this.formatDate(post.publishedAt)}
          </time>
        </div>
        <h1 class="post-title">${this.escapeHtml(post.title)}</h1>
      </header>
    `;

    // Store imageUrl for later use
    this._currentImageUrl = imageUrl;

    content.innerHTML = `
      ${heroHeader}

      ${post.excerpt ? `<p class="post-excerpt" dir="${dir}">${this.escapeHtml(post.excerpt)}</p>` : ''}

      ${post.tags && post.tags.length > 0 ? `<div class="post-tags" dir="${dir}">${tags}</div>` : ''}

      ${originalSource}

      <div class="post-content ql-editor" dir="${dir}">
        ${post.content}
      </div>

      <div class="social-share-container">
        <h3 class="social-share-title" data-i18n="blog.shareTitle">Share this article</h3>
        <div class="social-share">
          <a class="social-btn whatsapp" id="whatsapp-share" title="Share on WhatsApp">
            <svg viewBox="0 0 24 24">
              <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.215-3.751.983.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <a class="social-btn linkedin" id="linkedin-share" title="Share on LinkedIn">
            <svg viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a class="social-btn twitter" id="twitter-share" title="Share on X (Twitter)">
            <svg viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
      </div>

      <footer class="post-footer">
        <div class="post-updated">
          <span data-i18n="blog.lastUpdated">Last updated:</span>
          <time datetime="${post.updatedAt}">${this.formatDate(post.updatedAt)}</time>
        </div>
        <a href="/#blog" class="btn-secondary" data-i18n="blog.backToBlog">Back to Blog</a>
      </footer>
    `;

    // Set hero image background via JavaScript to avoid URL encoding issues
    if (this._currentImageUrl) {
      const heroImageEl = document.getElementById('postHeroImage');
      if (heroImageEl) {
        heroImageEl.style.backgroundImage = `url('${this._currentImageUrl}')`;
      }
    }

    // Attach social share listeners
    this.attachShareListeners();

    // Update page title and meta
    document.title = `${post.title} - Amjad Abujamous`;
    document.documentElement.dir = dir;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && post.excerpt) {
      metaDesc.setAttribute('content', post.excerpt);
    }
  }

  /**
   * Attach social share button listeners
   */
  attachShareListeners() {
    const pageUrl = encodeURIComponent(`${window.location.origin}/blog/${this.slug}`);
    const pageTitle = encodeURIComponent(document.title);

    const whatsappBtn = document.getElementById('whatsapp-share');
    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', () => {
        window.open(`https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}`, '_blank');
      });
    }

    const linkedinBtn = document.getElementById('linkedin-share');
    if (linkedinBtn) {
      linkedinBtn.addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`, '_blank');
      });
    }

    const twitterBtn = document.getElementById('twitter-share');
    if (twitterBtn) {
      twitterBtn.addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`, '_blank');
      });
    }
  }

  /**
   * Format date string
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const lang = window.appState?.currentLanguage || 'en';

    return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create global instance
const blogManager = new BlogManager();

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on blog post page or main page
  if (document.getElementById('blogPostContent')) {
    blogManager.initBlogPost();
  } else if (document.getElementById('blog')) {
    blogManager.initBlogList();
  }
});

export default blogManager;
