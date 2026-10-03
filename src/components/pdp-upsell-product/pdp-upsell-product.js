import EVENTS from '@/helpers/events';

class PDPUpsellProduct extends HTMLElement {
  constructor() {
    super();
    this.variantId = this.dataset.variantId;
    this.checkbox = this.querySelector('.pdp-upsell__checkbox input');
    this.handleChange = this.handleChange.bind(this);

    console.log('this.variantId', this.variantId);
  }

  async connectedCallback() {
    if (this.checkbox) {
      this.checkbox.addEventListener('change', this.handleChange);
      await this.checkCartState();
    }
  }

  disconnectedCallback() {
    if (this.checkbox) {
      this.checkbox.removeEventListener('change', this.handleChange);
    }
  }

  async checkCartState() {
    try {
      const response = await fetch(`${window.Shopify.routes.root}cart.js`);
      const cart = await response.json();

      const isInCart = cart.items.some(
        (item) => item.variant_id.toString() === this.variantId.toString(),
      );

      if (!isInCart) {
        this.classList.remove('not-initialized');
      } else {
        this.checkbox.checked = true;
        this.classList.add('is-completed');
      }
    } catch (error) {
      console.error('Error checking cart state:', error);
      this.classList.remove('not-initialized');
    }
  }

  async handleChange(event) {
    if (!event.target.checked) {
      this.classList.remove('is-completed');
      return;
    }

    try {
      const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              id: this.variantId,
              quantity: 1,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      // Dispatch cart update event to trigger slideout cart
      document.dispatchEvent(new CustomEvent(EVENTS.CART_ADD));

      // Add completed class
      setTimeout(() => {
        this.classList.add('is-completed');
      }, 2000);
    } catch (error) {
      console.error('Error adding product to cart:', error);
      this.checkbox.checked = false;
    }
  }
}

export default () => {
  customElements.get('pdp-upsell-product') ||
    customElements.define('pdp-upsell-product', PDPUpsellProduct);
};
