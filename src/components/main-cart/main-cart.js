import './main-cart.scss';

export class MainCart extends HTMLElement {
  constructor() {
    super();
    this.bindEvents();
  }

  bindEvents() {
    this.addEventListener('click', this.handleQuantityButtons);
    this.addEventListener('change', this.handleQuantityChange);
    this.addEventListener('click', this.handleRemoveButton);
    this.addEventListener('click', this.handleEditButton);
  }

  handleQuantityButtons(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const lineItem = button.closest('[data-line-item]');
    if (!lineItem) return;

    const input = lineItem.querySelector('input[type="number"]');
    const currentValue = parseInt(input.value, 10);
    const action = button.dataset.action;

    const newQuantity = action === 'increase' ? currentValue + 1 : currentValue - 1;
    if (newQuantity < 0) return;

    input.value = newQuantity;
    const key = lineItem.dataset.lineItemKey;
    this.updateLineItem(key, newQuantity);
  }

  handleQuantityChange(event) {
    const quantityInput = event.target.closest('input[type="number"]');
    if (!quantityInput) return;

    const lineItem = event.target.closest('[data-line-item]');
    if (!lineItem) return;

    const quantity = parseInt(quantityInput.value, 10);
    if (quantity < 1) {
      quantityInput.value = 1;
      return;
    }

    const key = lineItem.dataset.lineItemKey;
    this.updateLineItem(key, quantity);
  }

  handleRemoveButton(event) {
    const removeButton = event.target.closest('.cart__item-remove');
    if (!removeButton) return;

    const lineItem = removeButton.closest('[data-line-item]');
    if (!lineItem) return;

    const key = lineItem.dataset.lineItemKey;
    this.updateLineItem(key, 0);
  }

  handleEditButton(event) {
    const editButton = event.target.closest('.cart__item-edit-container button');
    if (!editButton) return;

    const lineItem = editButton.closest('[data-line-item]');
    if (!lineItem) return;

    const variantEditor = document.querySelector('minicart-variant-editor');
    if (variantEditor) {
      const productHandle = editButton.dataset.productHandle;
      const itemKey = lineItem.dataset.lineItemKey;
      const variantId = editButton.dataset.variantId;

      if (productHandle) {
        variantEditor.setAttribute('data-item-key', itemKey);
        variantEditor.setAttribute('data-product-handle', productHandle);
        variantEditor.setAttribute('data-variant-id', variantId);
        variantEditor.setAttribute('open', '');
      }
    }
  }

  async updateLineItem(key, quantity) {
    try {
      // Extract just the variant ID from the full key
      const variantId = key.split(':')[0];

      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: variantId,
          quantity,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const cart = await response.json();
      this.updateCartBadge(cart.item_count);
      this.updateCartUI(cart);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  updateCartUI(cart) {
    console.log('Cart response:', cart);

    // Remove line items with quantity 0
    const lineItems = this.querySelectorAll('[data-line-item]');
    lineItems.forEach((lineItem) => {
      const fullKey = lineItem.dataset.lineItemKey;
      const key = fullKey.split(':')[0]; // Get just the variant ID
      const itemExists = cart.items.some((item) => {
        const itemKey = item.key.split(':')[0];
        console.log('Comparing keys:', {
          lineItemKey: key,
          cartItemKey: itemKey,
          fullLineItemKey: fullKey,
          fullCartItemKey: item.key,
          matches: itemKey === key,
        });
        return itemKey === key;
      });

      console.log('Item existence check:', {
        key,
        fullKey,
        exists: itemExists,
        element: lineItem,
      });

      if (!itemExists) {
        lineItem.remove();
      }
    });

    // Update remaining line items
    cart.items.forEach((item) => {
      const itemKey = item.key.split(':')[0];
      const lineItem = this.querySelector(`[data-line-item-key^="${itemKey}"]`);
      console.log('Finding line item to update:', {
        itemKey,
        selector: `[data-line-item-key^="${itemKey}"]`,
        lineItemFound: !!lineItem,
      });

      if (!lineItem) return;

      const quantityInputs = lineItem.querySelectorAll('input[type="number"]');
      quantityInputs.forEach((input) => {
        input.value = item.quantity;
      });

      const finalPrices = lineItem.querySelectorAll('.cart__item-final-price');
      finalPrices.forEach((price) => {
        price.innerHTML = this.formatMoney(item.final_line_price);
      });

      const originalPrices = lineItem.querySelectorAll('.cart__item-original-price');
      originalPrices.forEach((price) => {
        if (item.original_line_price > item.final_line_price) {
          price.innerHTML = this.formatMoney(item.original_line_price);
        } else {
          price.innerHTML = '';
        }
      });
    });

    // Update cart subtotal
    const subtotalAmount = this.querySelector('.cart__subtotal-amount');
    if (subtotalAmount) {
      subtotalAmount.innerHTML = this.formatMoney(cart.items_subtotal_price);
    }

    // Show empty cart message if no items left
    const cartContent = this;
    const emptyCart = document.querySelector('[data-empty-cart]');

    console.log(cart);

    if (cart.item_count === 0) {
      if (cartContent) cartContent.classList.add('hidden');
      if (emptyCart) emptyCart.classList.remove('hidden');
    } else {
      if (cartContent) cartContent.classList.remove('hidden');
      if (emptyCart) emptyCart.classList.add('hidden');
    }
  }

  formatMoney(cents) {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }

  updateCartBadge(count) {
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
}

export default () => {
  customElements.get('main-cart') || customElements.define('main-cart', MainCart);
};
