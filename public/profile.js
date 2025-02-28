// Constants and Configurations
const CONFIG = {
  dateTimeFormat: 'YYYY-MM-DD HH:MM:SS',
  currentUser: 'Sangeeth62880',
  updateInterval: 1000,
  phoneRegex: /^\d{3} \d{3}-\d{4}$/,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Theme Management
class ThemeManager {
  constructor() {
      this.themeToggle = document.getElementById('themeToggle');
      this.body = document.documentElement; // Using documentElement for better dark mode support
      this.icon = this.themeToggle.querySelector('i');
      this.init();
  }

  init() {
      // Check for saved theme
      const savedTheme = localStorage.getItem('theme') || 'light';
      this.setTheme(savedTheme);

      this.themeToggle.addEventListener('click', () => {
          const newTheme = this.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
          this.setTheme(newTheme);
          localStorage.setItem('theme', newTheme);
          this.updateIcon(newTheme);
      });
  }

  setTheme(theme) {
      this.body.setAttribute('data-theme', theme);
      this.updateIcon(theme);
  }

  updateIcon(theme) {
      this.icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
      this.icon.classList.add('rotate-animation');
      setTimeout(() => this.icon.classList.remove('rotate-animation'), 500);
  }
}

// Time Display Management
class TimeDisplay {
  constructor() {
      this.timeElement = document.getElementById('currentTime');
      this.init();
  }

  init() {
      this.update();
      setInterval(() => this.update(), CONFIG.updateInterval);
  }

  update() {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      
      const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      
      this.timeElement.innerHTML = `
          <i class="far fa-clock"></i>
          <span>${formattedDateTime}</span>
      `;
  }
}

// Navigation Management
class NavigationManager {
  constructor() {
      this.navToggle = document.querySelector('.nav__toggle');
      this.navList = document.querySelector('.nav__list');
      this.init();
  }

  init() {
      if (this.navToggle && this.navList) {
          this.navToggle.addEventListener('click', () => {
              this.navToggle.classList.toggle('active');
              this.navList.classList.toggle('active');
              
              // Update toggle icon
              const icon = this.navToggle.querySelector('i');
              icon.className = this.navList.classList.contains('active') 
                  ? 'fas fa-times' 
                  : 'fas fa-bars';
          });
      }
  }
}

// User Menu Management
class UserMenuManager {
  constructor() {
      this.trigger = document.querySelector('.user-menu__trigger');
      this.dropdown = document.querySelector('.user-menu__dropdown');
      this.nameElements = document.querySelectorAll('.user-menu__name');
      this.init();
  }

  init() {
      // Set user name
      this.nameElements.forEach(el => el.textContent = CONFIG.currentUser);

      // Toggle dropdown
      if (this.trigger && this.dropdown) {
          this.trigger.addEventListener('click', (e) => {
              e.stopPropagation();
              this.dropdown.classList.toggle('active');
          });

          // Close on outside click
          document.addEventListener('click', (e) => {
              if (!this.trigger.contains(e.target)) {
                  this.dropdown.classList.remove('active');
              }
          });
      }
  }
}

// Tab Management
class TabManager {
  constructor() {
      this.triggers = document.querySelectorAll('.tabs__trigger');
      this.panels = document.querySelectorAll('.tabs__panel');
      this.init();
  }

  init() {
      this.triggers.forEach(trigger => {
          trigger.addEventListener('click', () => {
              const tabId = trigger.getAttribute('data-tab');
              this.activateTab(tabId);
          });
      });
  }

  activateTab(tabId) {
      this.triggers.forEach(t => t.classList.remove('active'));
      this.panels.forEach(p => p.classList.remove('active'));

      const activeTrigger = document.querySelector(`[data-tab="${tabId}"]`);
      const activePanel = document.querySelector(`[data-tab-content="${tabId}"]`);

      if (activeTrigger && activePanel) {
          activeTrigger.classList.add('active');
          activePanel.classList.add('active');
      }
  }
}

// Form Validation
class FormValidator {
  constructor(formId) {
      this.form = document.getElementById(formId);
      this.inputs = this.form ? this.form.querySelectorAll('input, textarea') : [];
      this.init();
  }

  init() {
      if (!this.form) return;

      this.inputs.forEach(input => {
          input.addEventListener('blur', () => this.validateInput(input));
          input.addEventListener('input', () => {
              if (input.parentElement.classList.contains('error')) {
                  this.validateInput(input);
              }
          });
      });

      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  validateInput(input) {
      const parent = input.parentElement;
      const errorElement = parent.querySelector('.form__error');
      let isValid = true;
      let errorMessage = '';

      // Required field validation
      if (input.required && !input.value.trim()) {
          isValid = false;
          errorMessage = 'This field is required';
      }
      // Email validation
      else if (input.type === 'email' && input.value) {
          if (!CONFIG.emailRegex.test(input.value)) {
              isValid = false;
              errorMessage = 'Please enter a valid email address';
          }
      }
      // Phone validation
      else if (input.type === 'tel' && input.value) {
          if (!CONFIG.phoneRegex.test(input.value)) {
              isValid = false;
              errorMessage = 'Please enter a valid phone number: 123 456-7890';
          }
      }

      parent.classList.toggle('error', !isValid);
      if (errorElement) {
          errorElement.textContent = errorMessage;
      }

      return isValid;
  }

  handleSubmit(e) {
      e.preventDefault();
      let isValid = true;

      this.inputs.forEach(input => {
          if (!this.validateInput(input)) {
              isValid = false;
          }
      });

      if (isValid) {
          console.log('Form submitted successfully');
          // Add your form submission logic here
      }
  }
}

// Avatar Upload Management
class AvatarUploader {
  constructor() {
      this.input = document.getElementById('avatarInput');
      this.preview = document.getElementById('avatarPreview');
      this.init();
  }

  init() {
      if (this.input && this.preview) {
          this.input.addEventListener('change', (e) => {
              const file = e.target.files[0];
              if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                      this.preview.src = e.target.result;
                  };
                  reader.readAsDataURL(file);
              }
          });
      }
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  new TimeDisplay();
  new NavigationManager();
  new UserMenuManager();
  new TabManager();
  new FormValidator('profileForm');
  new AvatarUploader();
});