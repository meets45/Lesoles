import './radio.scss';

export class RadioButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.input = this.querySelector('[data-radio-input]');
    this.label = this.querySelector('[data-radio-label]');
    this.helpText = this.querySelector('[data-radio-help]');

    if (this.input) {
      this.input.addEventListener('change', this.handleChange.bind(this));
    }
  }

  handleChange() {
    // Uncheck all other radio buttons in the same group
    const name = this.input?.getAttribute('name');
    if (name) {
      document.querySelectorAll(`[data-radio-input][name="${name}"]`).forEach(radio => {
        radio.closest('radio-button').removeAttribute('data-checked');
      });
    }

    // Update checked state using data attribute
    if (this.input.checked) {
      this.setAttribute('data-checked', '');
    } else {
      this.removeAttribute('data-checked');
    }

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('radio-change', {
      bubbles: true,
      detail: {
        checked: this.input.checked,
        value: this.input.value
      }
    }));
  }
}

export default () => {
  customElements.get('radio-button') ||
    customElements.define('radio-button', RadioButton);
};
