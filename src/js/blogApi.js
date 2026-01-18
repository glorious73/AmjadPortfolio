// Blog API Service
// Replace with your actual deployment ID
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzvBWE07omolFyrO7rA-zDjifaRRKCvCnI-3ikjdxn1FA0mFhddW-pddQ0L4NptUsAObQ/exec';

class BlogAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build URL with query parameters
   */
  buildUrl(params) {
    const url = new URL(this.baseUrl);
    url.searchParams.append('mode', 'api');

    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return url.toString();
  }

  /**
   * Fetch all published posts
   * @param {Object} options - Query options
   * @param {string} options.lang - Language filter ('en' or 'ar')
   * @param {string} options.tag - Tag filter
   * @param {number} options.limit - Limit results
   * @param {boolean} options.content - Include content (default: true)
   */
  async getPosts(options = {}) {
    try {
      const url = this.buildUrl(options);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      return data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  /**
   * Fetch a single post by slug
   * @param {string} slug - Post slug
   */
  async getPostBySlug(slug) {
    try {
      const url = this.buildUrl({ slug });
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Post not found');
      }

      return data.post;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  /**
   * Fetch a single post by ID
   * @param {string} id - Post ID
   */
  async getPostById(id) {
    try {
      const url = this.buildUrl({ id });
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Post not found');
      }

      return data.post;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  /**
   * Get image URL from post image object (supports Google Drive)
   * @param {Object} image - Image object from API
   * @param {number} size - Desired width in pixels (default: 400)
   * @returns {string|null} Image URL or null if no image
   */
  getImageUrl(image, size = 400) {
    if (!image) return null;

    if (image.driveId) {
      return `https://drive.google.com/thumbnail?id=${image.driveId}&sz=s${size}`;
    }

    return image.url || null;
  }
}

// Create and export singleton instance
export const blogApi = new BlogAPI(API_BASE_URL);