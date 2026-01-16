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
async function createLanguageSwitcher() {
  const switcher = document.createElement('div');
  switcher.className = 'language-switcher';

  // Fetch flag SVGs
  try {
    const [usFlagResponse, arabFlagResponse] = await Promise.all([
      fetch('/flags/Flag_of_the_United_States.svg'),
      fetch('/flags/Flag_of_the_Arab_League.svg')
    ]);

    const usFlagSvg = await usFlagResponse.text();
    const arabFlagSvg = await arabFlagResponse.text();

    switcher.innerHTML = `
      <button class="lang-btn ${window.appState.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">${usFlagSvg}</button>
      <button class="lang-btn ${window.appState.currentLanguage === 'ar' ? 'active' : ''}" data-lang="ar">${arabFlagSvg}</button>
    `;
  } catch (error) {
    console.error('Failed to load flag SVGs:', error);
    // Fallback to text if SVGs fail to load
    switcher.innerHTML = `
      <button class="lang-btn ${window.appState.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">EN</button>
      <button class="lang-btn ${window.appState.currentLanguage === 'ar' ? 'active' : ''}" data-lang="ar">AR</button>
    `;
  }

  switcher.addEventListener('click', async (e) => {
    if (e.target.classList.contains('lang-btn') || e.target.closest('.lang-btn')) {
      const button = e.target.classList.contains('lang-btn') ? e.target : e.target.closest('.lang-btn');
      const lang = button.getAttribute('data-lang');
      await window.appState.changeLanguage(lang);

      // Update active button
      switcher.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      });
    }
  });

  return switcher;
}

// Remove loading state and show content
function removeLoadingState() {
  // Clear initial styles and remove loading class
  const initialStyles = document.getElementById('initialStyles');
  if (initialStyles) {
    initialStyles.innerHTML = '';
  }
  document.body.classList.remove('loading');
  document.body.style.removeProperty('background-color');
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
    const switcher = await createLanguageSwitcher();
    sidebar.appendChild(switcher);
  }

  // Add language switcher to mobile nav panel
  const mobileNavPanel = document.querySelector('.mobile-nav-panel');
  if (mobileNavPanel) {
    const switcher = await createLanguageSwitcher();
    mobileNavPanel.appendChild(switcher);
  }

  // Remove loading state after translations and switchers are ready
  removeLoadingState();
});