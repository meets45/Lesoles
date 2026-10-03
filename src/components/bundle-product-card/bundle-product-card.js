import '@/components/product-card/product-card.scss';

import EVENTS from '@/helpers/events';

class BundleProductCard extends HTMLElement {
  constructor() {
    super();
    this.product = JSON.parse(this.getAttribute('data-product'));
    this.productId = this.getAttribute('data-product-id');
    this.variantId = this.getAttribute('data-current-variant-id');
    this.categoryId = this.getAttribute('data-category');

    // Elements
    this.addToCartButton = this.querySelector('[data-bundle-add-to-cart]');
    this.optionInputs = this.querySelectorAll('[data-product-option]');
    this.priceElement = this.querySelector('product-price');
    this.gallery = this.querySelector('product-media-gallery');

    this.init();
  }

  init() {
    if (this.addToCartButton) {
      this.addToCartButton.addEventListener('click', this.handleAddToCart.bind(this));
    }

    // Add change event listeners to all option inputs
    this.optionInputs.forEach(input => {
      input.addEventListener('change', this.handleOptionChange.bind(this));
    });

    // Initialize the current variant
    this.initializeVariant();
  }

  initializeVariant() {
    const currentVariant = this.product.variants.find(variant =>
      variant.id.toString() === this.variantId
    );

    if (currentVariant) {
      // Check the correct radio buttons
      this.optionInputs.forEach(input => {
        const name = input.getAttribute('name');
        const position = name.replace('option-', '');
        if (input.value === currentVariant[`option${position}`]) {
          input.checked = true;
          const wrapper = input.closest('.product-form-options__list-item');
          if (wrapper) {
            wrapper.classList.add('is-active');
          }
        }
      });

      // Update all UI elements
      this.updateOptionLabels(currentVariant);
      this.updateGallery(currentVariant);
      this.updatePrice(currentVariant);
    }
  }

  handleOptionChange(event) {
    const formData = new FormData();

    this.optionInputs.forEach(input => {
      if (input.checked) {
        const name = input.getAttribute('name');
        const position = name.replace('option-', '');
        formData.append(`option${position}`, input.value);
      }
    });

    const currentVariant = this.product.variants.find(variant => {
      return (
        (!formData.get('option1') || variant.option1 === formData.get('option1')) &&
        (!formData.get('option2') || variant.option2 === formData.get('option2')) &&
        (!formData.get('option3') || variant.option3 === formData.get('option3'))
      );
    });

    if (currentVariant) {
      this.variantId = currentVariant.id;

      // Update all UI elements
      this.updateOptionLabels(currentVariant);
      this.updateGallery(currentVariant);
      this.updatePrice(currentVariant);
      this.updateActiveStates(event.target);

      // Dispatch variant update event
      const variantUpdateEvent = new CustomEvent(EVENTS.PRODUCT_VARIANT_UPDATE, {
        detail: {
          product: this.product,
          variant: currentVariant
        },
        bubbles: true
      });

      // Dispatch to both the card and the gallery
      this.dispatchEvent(variantUpdateEvent);
      if (this.gallery) {
        this.gallery.dispatchEvent(variantUpdateEvent);
      }
    }
  }

  updateActiveStates(changedInput) {
    const list = changedInput.closest('.product-form-options__list');
    if (list) {
      list.querySelectorAll('.product-form-options__list-item').forEach(item => {
        item.classList.remove('is-active');
      });
      const wrapper = changedInput.closest('.product-form-options__list-item');
      if (wrapper) {
        wrapper.classList.add('is-active');
      }
    }
  }

  updateOptionLabels(variant) {
    for (let i = 1; i <= 3; i++) {
      const label = this.querySelector(`[data-option-${i}-label]`);
      if (label && variant[`option${i}`]) {
        label.textContent = variant[`option${i}`];
      }
    }
  }

  updateGallery(variant) {
    if (this.gallery) {
      // Dispatch the same event that product-form uses
      const variantUpdateEvent = new CustomEvent(EVENTS.PRODUCT_VARIANT_UPDATE, {
        detail: {
          product: this.product,
          variant: variant
        },
        bubbles: true
      });
      this.gallery.dispatchEvent(variantUpdateEvent);
    }
  }

  updatePrice(variant) {
    if (this.priceElement && variant.price) {
      this.priceElement.setPrice(variant.price);
      this.priceElement.setCompareAtPrice(variant.price, variant.compare_at_price);
      this.priceElement.setSavings(variant.price, variant.compare_at_price);

    }
  }

  handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();

    this.dispatchEvent(
      new CustomEvent(EVENTS.BUNDLE_ADD, {
        bubbles: true,
        detail: {
          productId: this.productId,
          variantId: this.variantId,
          categoryId: this.categoryId
        }
      })
    );
  }

  setSelected(selected) {
    this.classList.toggle('bundle-product-card--selected', selected);
    if (this.addToCartButton) {
      this.addToCartButton.classList.toggle('product-card__add-to-cart--selected', selected);
    }
  }

  setDisabled(disabled) {
    this.classList.toggle('bundle-product-card--disabled', disabled);
    if (this.addToCartButton) {
      if (disabled) {
        this.addToCartButton.setAttribute('disabled', '');
      } else {
        this.addToCartButton.removeAttribute('disabled');
      }
    }
  }
}

export default () => {
  customElements.define('bundle-product-card') ||
    customElements.define('bundle-product-card', BundleProductCard);
};
