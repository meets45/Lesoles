export class FormInput extends HTMLElement {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  connectedCallback() {
    try {
      this.input = this.querySelector('[data-input-field]');
      this.label = this.querySelector('[data-input-label]');
      this.helpText = this.querySelector('[data-input-help]');

      if (!this.input) {
        console.error('Form Input: No input found with [data-input-field]');
        return;
      }

      if (this.input.value) {
        this.setAttribute('data-has-value', '');
      }

      // Set initial validity state
      if (this.input.hasAttribute('required') && !this.input.value) {
        this.input.setCustomValidity('This field is required');
      }

      this.setupEventListeners();
    } catch (error) {
      console.error('Form Input: Error during initialization', error);
    }
  }

  disconnectedCallback() {
    if (this.input) {
      this.input.removeEventListener('input', this.handleChange);
    }
  }

  setupEventListeners() {
    if (this.input) {
      this.input.addEventListener('input', this.handleChange);
      this.input.addEventListener('invalid', () => {
        this.setAttribute('data-invalid', '');
      });
    }
  }

  handleChange() {
    const value = this.input.value.trim();

    if (value) {
      this.setAttribute('data-has-value', '');
      this.input.setCustomValidity('');
      this.removeAttribute('data-invalid');
    } else {
      this.removeAttribute('data-has-value');
      if (this.input.hasAttribute('required')) {
        this.input.setCustomValidity('This field is required');
      }
    }
  }

  // Add method to check validity on form submit
  checkValidity() {
    if (this.input.hasAttribute('required') && !this.input.value.trim()) {
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
  customElements.get('form-input') || customElements.define('form-input', FormInput);
}
