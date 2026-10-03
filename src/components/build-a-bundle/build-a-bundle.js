import SwiperSlider from '@/helpers/swiper-slider';
import EVENTS from '@/helpers/events';

import './build-a-bundle.scss';

class BuildABundle extends HTMLElement {
  constructor() {
    super();
    this.sliders = this.querySelectorAll('[data-slider]');
    this.resetButtons = this.querySelectorAll('[data-reset-selection]');
    this.categories = this.querySelectorAll('.build-a-bundle__category');

    this.selectedProducts = {};
    this.cartItems = {};
    this.isCartUpdating = false;

    this.init();
  }

  init() {
    // Initialize sliders
    this.initSliders();

    // Add event listeners
    this.addEventListeners();
  }

  initSliders() {
    if (!this.sliders.length) return;

    this.sliders.forEach(slider => {
      const categoryId = slider.getAttribute('data-slider');
      const scrollbar = this.querySelector(`[data-scrollbar="${categoryId}"]`);

      new SwiperSlider(slider, {
        slidesPerView: 'auto',
        slidesPerGroup: 1,
        watchSlidesProgress: true,
        scrollbar: {
          el: scrollbar,
          draggable: true,
          dragClass: 'build-a-bundle__scrollbar-drag',
          dragSize: 'auto',
        },
        breakpoints: {
          769: {
            slidesPerGroup: 4,
            slidesPerView: 4,
          },
        },
      });
    });
  }

  addEventListeners() {
    // Add click event to reset buttons
    this.resetButtons.forEach(button => {
      button.addEventListener('click', this.handleResetCategory.bind(this));
    });

    // Listen for bundle:add events from bundle-product-cards
    this.addEventListener(EVENTS.BUNDLE_ADD, this.handleBundleAdd.bind(this));
  }

  handleBundleAdd(event) {
    // If cart is currently updating, don't allow new selections
    if (this.isCartUpdating) {
      console.log('Cart is currently updating, please wait...');
      return;
    }

    const { productId, variantId, categoryId } = event.detail;
    const productCard = event.target;
    const categoryElement = this.querySelector(`.build-a-bundle__category[data-category="${categoryId}"]`);
    const resetButton = this.querySelector(`[data-reset-selection="${categoryId}"]`);

    if (!productId || !variantId || !categoryId || !categoryElement || !resetButton) {
      return;
    }

    // Select this product
    productCard.setSelected(true);
    this.selectedProducts[categoryId] = productId;

    // Mark category as completed
    categoryElement.classList.add('build-a-bundle__category--completed');

    // Grey out other products in this category
    this.greyOutOtherProducts(categoryId, productId);

    // Show reset button
    resetButton.style.display = 'block';

    // Add to cart
    this.addToCart(variantId, categoryId);
  }

  greyOutOtherProducts(categoryId, selectedProductId) {
    const categoryCards = this.querySelectorAll(`bundle-product-card[data-category="${categoryId}"]`);

    categoryCards.forEach(card => {
      const productId = card.getAttribute('data-product-id');
      card.setDisabled(productId !== selectedProductId);
    });
  }

  handleResetCategory(event) {
    if (this.isCartUpdating) {
      console.log('Cart is currently updating, please wait...');
      return;
    }

    const button = event.currentTarget;
    const categoryId = button.getAttribute('data-reset-selection');
    const categoryElement = this.querySelector(`.build-a-bundle__category[data-category="${categoryId}"]`);

    if (!categoryId || !categoryElement) {
      return;
    }

    // Find and unselect the selected product
    if (this.selectedProducts[categoryId]) {
      const selectedCard = this.querySelector(`bundle-product-card[data-product-id="${this.selectedProducts[categoryId]}"][data-category="${categoryId}"]`);
      if (selectedCard) {
        selectedCard.setSelected(false);
        selectedCard.setDisabled(false);
      }

      // Remove from cart
      if (this.cartItems[categoryId]) {
        this.removeFromCart(this.cartItems[categoryId]);
        delete this.cartItems[categoryId];
      }

      // Clear selection
      delete this.selectedProducts[categoryId];
    }

    // Remove completed class from category
    categoryElement.classList.remove('build-a-bundle__category--completed');

    // Hide reset button
    button.style.display = 'none';

    // Enable all products in this category
    const categoryCards = categoryElement.querySelectorAll('bundle-product-card');
    categoryCards.forEach(card => {
      card.setDisabled(false);
    });
  }

  addToCart(variantId, categoryId) {
    this.isCartUpdating = true;

    const data = {
      items: [{
        id: variantId,
        quantity: 1,
        properties: {
          '_bundle_category': categoryId,
          '_bundle_item': true
        }
      }]
    };

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(response => {
      const item = response.items && response.items[0];
      if (item) {
        this.cartItems[categoryId] = item.variant_id || variantId;

        // Dispatch both events to ensure cart updates and slideout opens
        document.dispatchEvent(new CustomEvent(EVENTS.CART_ADD, { detail: response, bubbles: true }));
      } else {
        console.error('Unexpected response format from cart/add.js:', response);
      }

      this.isCartUpdating = false;
    })
    .catch(error => {
      console.error('Error adding product to cart:', error);
      this.isCartUpdating = false;
    });
  }

  removeFromCart(variantId) {
    this.isCartUpdating = true;

    const data = {
      updates: {
        [variantId]: 0
      }
    };

    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(cart => {
      document.dispatchEvent(new CustomEvent(EVENTS.CART_ADD, {
        detail: cart,
        bubbles: true
      }));

      this.isCartUpdating = false;
    })
    .catch(error => {
      console.error('Error removing product from cart:', error);
      this.isCartUpdating = false;
    });
  }
}

export default () => {
  customElements.get('build-a-bundle') ||
    customElements.define('build-a-bundle', BuildABundle);
};
