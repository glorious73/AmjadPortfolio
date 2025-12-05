// Global state management
class AppState {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = {};
    this.listeners = [];
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(listener => listener(this));
  }

  // Load translations for a specific language
  async loadTranslations(language) {
    try {
      const response = await fetch(`/i18n/${language}.json`);
      this.translations = await response.json();
      this.currentLanguage = language;
      this.notify();
      return true;
    } catch (error) {
      console.error('Failed to load translations:', error);
      return false;
    }
  }

  // Get translation by key (supports nested keys like 'sections.home.title')
  t(key) {
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return value;
  }

  // Change language
  async changeLanguage(language) {
    if (language !== this.currentLanguage) {
      const success = await this.loadTranslations(language);
      if (success) {
        localStorage.setItem('preferredLanguage', language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      }
      return success;
    }
    return true;
  }

  // Initialize with saved language or browser language
  async initialize() {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const browserLanguage = navigator.language.startsWith('ar') ? 'ar' : 'en';
    const initialLanguage = savedLanguage || browserLanguage;
    
    await this.loadTranslations(initialLanguage);
    document.documentElement.lang = this.currentLanguage;
    document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }
}

// Create global instance
window.appState = new AppState();