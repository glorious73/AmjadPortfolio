// Theme Management
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('themeToggle');
    this.mobileThemeToggle = document.getElementById('mobileThemeToggle');
    this.themeIcon = this.themeToggle?.querySelector('.theme-icon');
    this.themeText = this.themeToggle?.querySelector('.theme-text');
    this.mobileThemeIcon = this.mobileThemeToggle?.querySelector('.theme-icon');
    this.mobileThemeText = this.mobileThemeToggle?.querySelector('.theme-text');
    
    this.init();
  }
  
  init() {
    // Load saved theme or detect device preference
    const savedTheme = localStorage.getItem('theme');
    const deviceTheme = this.getDeviceThemePreference();
    const theme = savedTheme || deviceTheme;
    this.setTheme(theme);
    
    // Add event listeners
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    if (this.mobileThemeToggle) {
      this.mobileThemeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }
  
  getDeviceThemePreference() {
    // Check if device prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    this.updateThemeUI(theme);
  }
  
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  updateThemeUI(theme) {
    // Update desktop theme toggle
    if (this.themeIcon && this.themeText) {
      if (theme === 'dark') {
        this.themeIcon.textContent = '☀️';
        this.themeText.textContent = 'Light';
      } else {
        this.themeIcon.textContent = '🌙';
        this.themeText.textContent = 'Dark';
      }
    }
    
    // Update mobile theme toggle
    if (this.mobileThemeIcon && this.mobileThemeText) {
      if (theme === 'dark') {
        this.mobileThemeIcon.textContent = '☀️';
        this.mobileThemeText.textContent = 'Light';
      } else {
        this.mobileThemeIcon.textContent = '🌙';
        this.mobileThemeText.textContent = 'Dark';
      }
    }
  }
}

// Initialize theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});