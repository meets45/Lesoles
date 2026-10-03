import EVENTS from '@/helpers/events';

class ApplePayButton extends HTMLElement {
  constructor() {
    super();
    this.addToCartButton = document.querySelector('#add-to-cart');
  }

  connectedCallback() {
    this.checkDeviceAndInit();
  }

  checkDeviceAndInit() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isMobile = window.innerWidth <= 768;

    if (isIOS && isMobile) {
      this.classList.add('mobile');
      this.addToCartButton?.classList.add('with-apple-pay');
      this.style.display = 'flex';
    } else {
      this.style.display = 'none';
    }
  }

  disconnectedCallback() {
    this.addToCartButton?.classList.remove('with-apple-pay');
  }
}

/**
 * Handles product form interactions: sending request to the Cart API.
 */
class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.product = JSON.parse(this.getAttribute('data-product'));
    this.form = this.querySelector('form');
    this.isMainForm = this.getAttribute('data-main') === 'true';
    this.formOptions = this.querySelector('product-form-options');
    this.stickyAtc = document.querySelector('pdp-sticky-atc');
    this.idInput = this.form.querySelector('[name="id"]');
    this.prices = this.form.querySelectorAll('product-price');
    this.option1Label = this.querySelector('[data-option-1-label]');
    this.option2Label = this.querySelector('[data-option-2-label]');
    this.option3Label = this.querySelector('[data-option-3-label]');
    this.submit = this.querySelector('[data-submit]');
    this.error = this.querySelector('[data-error]');
    this.gallery =
      this.querySelector('product-media-gallery') ||
      document.querySelector('product-media-gallery');
    this.variantImage = this.querySelector('variant-image');
    this.isProductCard = this.closest('product-card') ? true : false;
    this.isMinicartVariantEditor = this.closest('minicart-variant-editor') ? true : false;

    // Initialize with current variant state
    this.getInitialVariantStatus();
  }

  connectedCallback() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.form.addEventListener('change', this.handleChange.bind(this));
    if (this.isMainForm)
      document.addEventListener(EVENTS.ADD_TO_CART, () => this.form.requestSubmit());
  }

  disconnectedCallback() {
    this.form.removeEventListener('submit', this.handleSubmit.bind(this));
    this.form.removeEventListener('change', this.handleChange.bind(this));
    if (this.isMainForm)
      document.removeEventListener(EVENTS.ADD_TO_CART, () => this.form.requestSubmit());
  }

  /**
   * Find a variant that matches the current selection of product options.
   * @param {Array} selectedOptions - Array containing the currently selected values.
   * @returns {Object|undefined} - The matching variant object or undefined if no match is found.
   */
  getCurrentVariant() {
    const formData = new FormData(this.form);
    const option1 = formData.get('option-1');
    const option2 = formData.get('option-2');
    const option3 = formData.get('option-3');
    return this.product.variants.find((variant) => {
      if (
        variant.option1 === option1 &&
        variant.option2 === option2 &&
        variant.option3 === option3
      ) {
        return variant;
      }
    });
  }

  setError() {
    this.error?.setAttribute('data-active', true);
  }

  clearError() {
    this.error?.setAttribute('data-active', false);
  }

  getInitialVariantStatus() {
    const currentVariant = this.getCurrentVariant();
    console.log('currentVariant', currentVariant);
  }

  async handleSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        this.dispatchEvent(new CustomEvent(EVENTS.CART_ADD, { detail: json, bubbles: true }));
        this.updateCartBadge();
      }
    } catch (error) {
      console.error(error);
      this.setError();
    }
  }

  handleChange(e) {
    if (e.target.closest('[data-product-option]')) {
      this.clearError();
      this.currentVariant = this.getCurrentVariant();

      const event = new CustomEvent(EVENTS.PRODUCT_VARIANT_UPDATE, {
        detail: {
          product: this.product,
          variant: this.currentVariant,
        },
      });

      // update product media gallery
      if (this.gallery && !this.isMinicartVariantEditor) {
        this.gallery.dispatchEvent(event);
      }

      if (this.variantImage) {
        this.variantImage.dispatchEvent(event);
      }

      // update sticky atc on pdp
      if (this.stickyAtc && !this.isProductCard && !this.isMinicartVariantEditor) {
        this.stickyAtc.dispatchEvent(event);
      }

      if (this.isMainForm) document.dispatchEvent(event);

      this.render();
    }
  }

  handleVariantChange(event) {
    this.currentVariant = event.detail.variant;
    this.render();
  }

  setPrices() {
    this.prices.forEach((price) => {
      price.setPrice(this.currentVariant.price);
      price.setCompareAtPrice(this.currentVariant.price, this.currentVariant.compare_at_price);
      price.setSavings(this.currentVariant.price, this.currentVariant.compare_at_price);
    });
  }

  render() {
    if (this.currentVariant) {
      this.idInput.value = this.currentVariant.id;
      this.setPrices();
      if (this?.option1Label) this.option1Label.innerText = this.currentVariant.option1;
      if (this?.option2Label) this.option2Label.innerText = this.currentVariant.option2;
      if (this?.option3Label) this.option3Label.innerText = this.currentVariant.option3;

      // Handle availability
      if (this.submit && !this.submit.dataset.quickAdd) {
        if (this.currentVariant.available) {
          this.submit.removeAttribute('disabled');
          this.submit.textContent = 'Add to Cart';
        } else {
          this.submit.setAttribute('disabled', '');
          this.submit.textContent = 'Sold Out';
        }
      }

      // update url on pdp
      if (!this.isProductCard && !this.isMinicartVariantEditor) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('variant', this.currentVariant.id);
        window.history.replaceState({}, '', newUrl.toString());
      }

      // update urls on product card
      console.log('isProductCard', this.isProductCard);
      if (this.isProductCard) {
        const card = this.closest('product-card');

        card.querySelectorAll('a').forEach((link) => {
          link.href = `/products/${this.product.handle}?variant=${this.currentVariant.id}`;
        });

        const quickAdd = card.querySelector('button[data-quick-add="true"]');

        if (quickAdd) {
          if (this.currentVariant.available) {
            quickAdd.classList.remove('hidden');
          } else {
            quickAdd.classList.add('hidden');
          }
        }
      }
    }
  }

  async updateCartBadge() {
    try {
      const res = await fetch('/cart.js');

      if (res.ok) {
        const json = await res.json();
        const count = json.item_count;

        const iconButtons = document.querySelectorAll('[data-cart-toggle-button] .icon-button__icon');

        iconButtons.forEach((iconButton) => {
          let badge = iconButton.querySelector('.icon-button__badge');

          if (badge) {
            if (count > 0) {
              badge.textContent = count;
              badge.classList.remove('hidden');
            } else {
              badge.classList.add('hidden');
            }
          }
        });
      }
    } catch (error) {
      console.error(error);
      this.setError();
    }
  }
}

export { ProductForm };

export default () => {
  customElements.get('apple-pay-button') ||
    customElements.define('apple-pay-button', ApplePayButton);
  customElements.get('product-form') ||
    customElements.define('product-form', ProductForm);
};
