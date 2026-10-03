import './quantity-input.scss';

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.incrementButton = this.querySelector('[data-quantity-increment]');
    this.decrementButton = this.querySelector('[data-quantity-decrement]');
    this.incrementButton.addEventListener('click', this.increment.bind(this));
    this.decrementButton.addEventListener('click', this.decrement.bind(this));
  }

  increment() {
    const quantity = parseInt(this.input.value);
    this.input.value = quantity + 1;
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  decrement() {
    const quantity = parseInt(this.input.value);
    this.input.value = quantity > 1 ? quantity - 1 : 1;
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

export default () => {
  customElements.get('quantity-input') ||
    customElements.define('quantity-input', QuantityInput);
};
