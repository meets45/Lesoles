import './mobile-floating-header.scss';

import EVENTS from '@/helpers/events';

class MobileFloatingHeader extends HTMLElement {
  constructor() {
    super();
    this.expandPrimary = this.querySelector('[data-expand-primary]');
    this.expandSecondary = this.querySelector('[data-expand-secondary]');
    this.addToCart = this.querySelector('[data-add-to-cart]');
  }

  connectedCallback() {
    if (this.expandPrimary)
      this.expandPrimary.addEventListener('click', this.showPrimary.bind(this));
    if (this.expandSecondary)
      this.expandSecondary.addEventListener('click', this.showSecondary.bind(this));
    if (this.addToCart)
      this.addToCart.addEventListener('click', this.handleAddToCartClick.bind(this));
  }

  disconnectedCallback() {
    if (this.expandPrimary)
      this.expandPrimary.removeEventListener('click', this.showPrimary.bind(this));
    if (this.expandSecondary)
      this.expandSecondary.removeEventListener('click', this.showSecondary.bind(this));
    if (this.addToCart)
      this.addToCart.removeEventListener('click', this.handleAddToCartClick.bind(this));
  }

  showPrimary() {
    this.setAttribute('data-expanded', 'primary');
  }

  showSecondary() {
    this.setAttribute('data-expanded', 'secondary');
  }

  handleAddToCartClick() {
    console.log('clicked');
    document.dispatchEvent(new CustomEvent(EVENTS.ADD_TO_CART, { bubbles: true }));
  }
}

export default () => {
  customElements.get('mobile-floating-header') ||
  customElements.define('mobile-floating-header', MobileFloatingHeader);
};
