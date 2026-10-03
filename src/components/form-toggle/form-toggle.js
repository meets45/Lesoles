import './form-toggle.scss';

export class FormToggle extends HTMLElement {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  connectedCallback() {
    try {
      this.input = this.querySelector('[data-toggle-input]');
      this.label = this.querySelector('[data-toggle-label]');
      this.helpText = this.querySelector('[data-toggle-help]');

      if (!this.input) {
        console.error('Form Toggle: No input found with [data-toggle-input]');
        return;
      }

      if (this.input.checked) {
        this.setAttribute('data-checked', '');
      }

      // Set initial validity state
      if (this.input.hasAttribute('required') && !this.input.checked) {
        this.input.setCustomValidity('This field is required');
      }

      this.setupEventListeners();
    } catch (error) {
      console.error('Form Toggle: Error during initialization', error);
    }
  }

  disconnectedCallback() {
    if (this.input) {
      this.input.removeEventListener('change', this.handleChange);
    }
  }

  setupEventListeners() {
    if (this.input) {
      this.input.addEventListener('change', this.handleChange);
      this.input.addEventListener('invalid', () => {
        this.setAttribute('data-invalid', '');
      });
    }
  }

  handleChange() {
    if (this.input.checked) {
      this.setAttribute('data-checked', '');
      this.input.setCustomValidity('');
      this.removeAttribute('data-invalid');
    } else {
      this.removeAttribute('data-checked');
      if (this.input.hasAttribute('required')) {
        this.input.setCustomValidity('This field is required');
      }
    }
  }

  checkValidity() {
    if (this.input.hasAttribute('required') && !this.input.checked) {
      this.input.setCustomValidity('This field is required');
      this.setAttribute('data-invalid', '');
      return false;
    }
    this.input.setCustomValidity('');
    this.removeAttribute('data-invalid');
    return true;
  }
}

export default () => {
  customElements.get('form-toggle') ||
    customElements.define('form-toggle', FormToggle);
}
