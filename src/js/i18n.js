// Translation helper functions
function t(key) {
  return window.appState.t(key);
}

// Update all elements with data-i18n attribute
function updateTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else if (element.tagName === 'META') {
      element.content = translation;
    } else if (element.tagName === 'A') {
      // Handle contact links
      if (element.classList.contains('contact-email')) {
        element.href = `mailto:${translation}`;
      } else if (element.classList.contains('contact-phone')) {
        element.href = `tel:${translation}`;
      } else if (element.classList.contains('contact-linkedin') || element.classList.contains('contact-github')) {
        element.href = translation;
      }
      element.textContent = translation;
    } else {
      element.textContent = translation;
    }
  });
}

// Language switcher
function createLanguageSwitcher() {
  const switcher = document.createElement('div');
  switcher.className = 'language-switcher';
  switcher.innerHTML = `
    <button class="lang-btn ${window.appState.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">EN</button>
    <button class="lang-btn ${window.appState.currentLanguage === 'ar' ? 'active' : ''}" data-lang="ar">AR</button>
  `;
  
  switcher.addEventListener('click', async (e) => {
    if (e.target.classList.contains('lang-btn')) {
      const lang = e.target.getAttribute('data-lang');
      await window.appState.changeLanguage(lang);
      
      // Update active button
      switcher.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      });
    }
  });
  
  return switcher;
}

// Initialize i18n system
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize app state
  await window.appState.initialize();
  
  // Subscribe to state changes
  window.appState.subscribe(() => {
    updateTranslations();
  });
  
  // Initial translation update
  updateTranslations();
  
  // Add language switcher to sidebar
  const sidebar = document.querySelector('.sidebar-content');
  if (sidebar) {
    const switcher = createLanguageSwitcher();
    sidebar.appendChild(switcher);
  }
  
  // Add language switcher to mobile nav panel
  const mobileNavPanel = document.querySelector('.mobile-nav-panel');
  if (mobileNavPanel) {
    const switcher = createLanguageSwitcher();
    mobileNavPanel.appendChild(switcher);
  }
});