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
      this.posts = data.posts || [];
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
            <a href="/blog.html?slug=${encodeURIComponent(post.slug)}">${this.escapeHtml(post.title)}</a>
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

    // Get slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
      this.showPostError();
      return;
    }

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

      const post = await blogApi.getPostBySlug(slug);

      this.renderPost(post);

      loading.style.display = 'none';
      content.style.display = 'block';
    } catch (err) {
      console.error('Failed to load post:', err);
      this.showPostError();
    }
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

    content.innerHTML = `
      <header class="post-header" dir="${dir}">
        <div class="post-meta">
          <span class="post-lang-badge">${post.lang.toUpperCase()}</span>
          <time class="post-date" datetime="${post.publishedAt}">
            ${this.formatDate(post.publishedAt)}
          </time>
        </div>

        <h1 class="post-title">${this.escapeHtml(post.title)}</h1>

        ${post.excerpt ? `<p class="post-excerpt">${this.escapeHtml(post.excerpt)}</p>` : ''}

        ${post.tags && post.tags.length > 0 ? `<div class="post-tags">${tags}</div>` : ''}

        ${originalSource}
      </header>

      <div class="post-content" dir="${dir}">
        ${post.content}
      </div>

      <footer class="post-footer">
        <div class="post-updated">
          <span data-i18n="blog.lastUpdated">Last updated:</span>
          <time datetime="${post.updatedAt}">${this.formatDate(post.updatedAt)}</time>
        </div>
        <a href="/#blog" class="btn-secondary" data-i18n="blog.backToBlog">Back to Blog</a>
      </footer>
    `;

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
