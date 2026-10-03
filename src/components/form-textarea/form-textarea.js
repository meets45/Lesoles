export class FormTextarea extends HTMLElement {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  connectedCallback() {
    try {
      this.textarea = this.querySelector('[data-textarea-field]');
      this.label = this.querySelector('[data-textarea-label]');
      this.helpText = this.querySelector('[data-textarea-help]');

      if (!this.textarea) {
        console.error('Form Textarea: No textarea found with [data-textarea-field]');
        return;
      }

      if (this.textarea.value) {
        this.setAttribute('data-has-value', '');
      }

      // Set initial validity state
      if (this.textarea.hasAttribute('required') && !this.textarea.value) {
        this.textarea.setCustomValidity('This field is required');
      }

      this.setupEventListeners();
    } catch (error) {
      console.error('Form Textarea: Error during initialization', error);
    }
  }

  disconnectedCallback() {
    if (this.textarea) {
      this.textarea.removeEventListener('input', this.handleChange);
    }
  }

  setupEventListeners() {
    if (this.textarea) {
      this.textarea.addEventListener('input', this.handleChange);
      this.textarea.addEventListener('invalid', () => {
        this.setAttribute('data-invalid', '');
      });
    }
  }

  handleChange() {
    const value = this.textarea.value.trim();

    if (value) {
      this.setAttribute('data-has-value', '');
      this.textarea.setCustomValidity('');
      this.removeAttribute('data-invalid');
    } else {
      this.removeAttribute('data-has-value');
      if (this.textarea.hasAttribute('required')) {
        this.textarea.setCustomValidity('This field is required');
      }
    }
  }

  // Add method to check validity on form submit
  checkValidity() {
    if (this.textarea.hasAttribute('required') && !this.textarea.value.trim()) {
      this.textarea.setCustomValidity('This field is required');
      this.setAttribute('data-invalid', '');
      return false;
    }
    this.textarea.setCustomValidity('');
    this.removeAttribute('data-invalid');
    return true;
  }
}

export default () => {
  customElements.get('form-textarea') ||
    customElements.define('form-textarea', FormTextarea);
}
