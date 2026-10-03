import './checkbox.scss';

export class Checkbox extends HTMLElement {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  connectedCallback() {
    try {
      this.input = this.querySelector('[data-checkbox-input]');
      this.label = this.querySelector('[data-checkbox-label]');
      this.helpText = this.querySelector('[data-checkbox-help]');

      if (!this.input) {
        console.error('Form Checkbox: No input found with [data-checkbox-input]');
        return;
      }

      // Set initial validity state
      if (this.input.hasAttribute('required') && !this.input.checked) {
        this.input.setCustomValidity('This field is required');
      }

      this.setupEventListeners();
    } catch (error) {
      console.error('Form Checkbox: Error during initialization', error);
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

  // Add method to check validity on form submit
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
  customElements.get('form-checkbox') || customElements.define('form-checkbox', Checkbox);
}
