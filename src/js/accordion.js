// Mobile Accordion System
class MobileAccordion {
  constructor() {
    this.sections = [];
    this.isMobile = false;
    this.mediaQuery = window.matchMedia('(max-width: 1024px)');
    this.initialized = false;

    // Sections to convert (home excluded - stays always visible)
    this.sectionIds = ['experience', 'about', 'education', 'projects', 'skills', 'blog', 'contact'];

    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.handleMediaChange(this.mediaQuery);
      this.mediaQuery.addEventListener('change', (e) => this.handleMediaChange(e));
    });
  }

  handleMediaChange(e) {
    this.isMobile = e.matches;

    if (this.isMobile && !this.initialized) {
      this.setupAccordions();
      this.initialized = true;
    }

    // Toggle accordion visibility based on screen size
    this.sections.forEach(section => {
      if (this.isMobile) {
        section.element.classList.add('accordion-section');
        section.element.setAttribute('data-accordion-state', 'collapsed');
        section.header.setAttribute('aria-expanded', 'false');
      } else {
        section.element.classList.remove('accordion-section');
        section.element.setAttribute('data-accordion-state', 'expanded');
        section.header.setAttribute('aria-expanded', 'true');
      }
    });
  }

  setupAccordions() {
    this.sectionIds.forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;

      // Find the title element (h1 or h2)
      const title = section.querySelector('h1, h2');
      if (!title) return;

      // Get all content after the title (siblings)
      const contentElements = [];
      let sibling = title.nextElementSibling;
      while (sibling) {
        contentElements.push(sibling);
        sibling = sibling.nextElementSibling;
      }

      // Create accordion header button
      const header = document.createElement('button');
      header.className = 'accordion-header';
      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('aria-controls', `${id}-content`);
      header.setAttribute('id', `${id}-header`);

      // Clone title into header (preserve original attributes like data-i18n)
      const titleClone = title.cloneNode(true);
      header.appendChild(titleClone);

      // Add chevron icon
      const iconSpan = document.createElement('span');
      iconSpan.className = 'accordion-icon';
      iconSpan.setAttribute('aria-hidden', 'true');
      iconSpan.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
        </svg>
      `;
      header.appendChild(iconSpan);

      // Create accordion content wrapper
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'accordion-content';
      contentWrapper.setAttribute('id', `${id}-content`);
      contentWrapper.setAttribute('role', 'region');
      contentWrapper.setAttribute('aria-labelledby', `${id}-header`);

      // Move content elements into wrapper
      contentElements.forEach(el => {
        contentWrapper.appendChild(el);
      });

      // Replace original title with header and add content wrapper
      title.replaceWith(header);
      section.appendChild(contentWrapper);

      // Set initial state
      section.setAttribute('data-accordion-state', 'collapsed');
      section.classList.add('accordion-section');

      // Store reference
      const sectionData = {
        id,
        element: section,
        header,
        content: contentWrapper
      };
      this.sections.push(sectionData);

      // Add click handler
      header.addEventListener('click', () => this.toggle(sectionData));

      // Keyboard accessibility
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle(sectionData);
        }
      });
    });
  }

  toggle(sectionData) {
    if (!this.isMobile) return;

    const isExpanded = sectionData.element.getAttribute('data-accordion-state') === 'expanded';

    if (isExpanded) {
      this.collapse(sectionData);
    } else {
      this.expand(sectionData);
    }
  }

  expand(sectionData) {
    sectionData.element.setAttribute('data-accordion-state', 'expanded');
    sectionData.header.setAttribute('aria-expanded', 'true');
  }

  collapse(sectionData) {
    sectionData.element.setAttribute('data-accordion-state', 'collapsed');
    sectionData.header.setAttribute('aria-expanded', 'false');
  }

  // Expand a specific section by ID (for nav integration)
  expandById(id) {
    const sectionData = this.sections.find(s => s.id === id);
    if (sectionData && this.isMobile) {
      this.expand(sectionData);
    }
  }

  // Collapse all sections
  collapseAll() {
    this.sections.forEach(s => this.collapse(s));
  }
}

// Create global instance
window.mobileAccordion = new MobileAccordion();
