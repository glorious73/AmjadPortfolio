class Contact {
  constructor() {
    this.formLoadTime = null;
    this.MIN_SUBMIT_TIME_MS = 3000; // Minimum 3 seconds to fill form
    this.ENDPOINT_URL = 'https://script.google.com/macros/s/AKfycbxFe2ZcGl5goiMK6z3OHIVCDW-4llMg-oLapSGmBOB3-1UQkXwPT3yBXOaFsAedmGC43A/exec';
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Contact();
    }
    return this.instance;
  }

  initialize() {
    const form = document.querySelector('#contactForm');
    if (form) {
      this.formLoadTime = Date.now();
      form.addEventListener('submit', (e) => this.submit(e, form));

      // Set language field based on current app state
      this.updateLanguageField();

      // Subscribe to language changes
      if (window.appState) {
        window.appState.subscribe(() => this.updateLanguageField());
      }
    }
  }

  updateLanguageField() {
    const langField = document.querySelector('#Lang');
    if (langField && window.appState) {
      langField.value = window.appState.currentLanguage;
    }
  }

  isBot(form) {
    // Check honeypot field
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      return true;
    }
    // Check timing (bots submit too fast)
    if (this.formLoadTime && (Date.now() - this.formLoadTime) < this.MIN_SUBMIT_TIME_MS) {
      return true;
    }
    return false;
  }

  async submit(e, form) {
    e.preventDefault();

    // Bot detection - silently fail
    if (this.isBot(form)) {
      return;
    }

    // UI - show loading state
    const button = document.querySelector('#contactSubmit');
    const btnText = button.querySelector('.btn-text');
    const originalText = btnText.textContent;

    button.setAttribute('aria-busy', 'true');
    button.setAttribute('disabled', '');

    // Ensure lang field is up to date before submission
    this.updateLanguageField();

    // Prepare form data - exclude honeypot
    const data = new FormData(form);
    data.delete('website');

    try {
      await fetch(this.ENDPOINT_URL, {
        method: 'POST',
        body: data
      });

      button.setAttribute('aria-busy', 'false');

      // Show success SVG icon
      btnText.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
        </svg>
      `;
      button.classList.add('success');

    } catch (err) {
      button.setAttribute('aria-busy', 'false');

      // Show error SVG icon
      btnText.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
        </svg>
      `;
      button.classList.add('error');

    } finally {
      // Auto-clear after 1.5 seconds
      setTimeout(() => {
        this.clear(form);
        button.removeAttribute('disabled');
        button.classList.remove('success', 'error');
        // Restore button text from translations or original
        const translatedText = window.appState?.t('contactPage.form.submit');
        btnText.textContent = translatedText || originalText;
      }, 1500);
    }
  }

  clear(form) {
    // Clear all inputs except hidden fields
    const inputs = form.querySelectorAll('input:not([type="hidden"])');
    inputs.forEach(input => input.value = '');

    // Clear textarea
    const message = form.querySelector('textarea');
    if (message) {
      message.value = '';
    }

    // Reset select to first option
    const select = form.querySelector('select');
    if (select) {
      select.selectedIndex = 0;
    }

    // Reset form load time for next submission
    this.formLoadTime = Date.now();
  }
}

export const contact = Contact.getInstance();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  contact.initialize();
});
