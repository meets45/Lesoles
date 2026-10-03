import './minicart.scss';

import EVENTS from '@/helpers/events';
import SectionsAPIService from '@/helpers/sections-api-service';
import parseHTML from '@/helpers/parse-html';
import { disableBodyScroll, enableBodyScroll } from '@/helpers/body-scroll';

class Minicart extends HTMLElement {
  constructor() {
    super();

    this.isOpen = false;

    this.sectionId = this.getAttribute('data-section-id');

    // Bind methods
    this.open = this.open.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);

    this.drawer = this.querySelector('.minicart__drawer');
    this.content = this.querySelector('.minicart__content');

    this.debounce = undefined;
  }

  connectedCallback() {
    this.addEventListener('click', this.handleCloseClick.bind(this));
    this.addEventListener('click', this.handleRemoveClick.bind(this));
    this.addEventListener('change', this.handleQuantityChange.bind(this));
    document.addEventListener('keyup', this.handleKeyup);
    document.addEventListener(EVENTS.CART_ADD, this.open.bind(this));
    document.addEventListener(EVENTS.CART_UPDATE, this.render.bind(this));

    document.querySelectorAll('[data-cart-toggle-button]').forEach((button) => {
      button.addEventListener('click', this.toggle.bind(this));
    });
  }

  disconnectedCallback() {
    this.closeButton?.removeEventListener('click', this.close);
    document.removeEventListener('keyup', this.handleKeyup);
    document.removeEventListener(EVENTS.CART_ADD, this.open.bind(this));
    document.removeEventListener(EVENTS.CART_UPDATE, this.render.bind(this));

    document.querySelectorAll('[data-cart-toggle-button]').forEach((button) => {
      button.removeEventListener('click', this.toggle.bind(this));
    });
  }

  handleKeyup(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    disableBodyScroll();
    this.setAttribute('aria-hidden', 'false');
    this.setAttribute('data-active', true);
    this.render();
  }

  handleCloseClick(e) {
    if (e.target.closest('[data-close]')) {
      this.close();
    }
  }

  close() {
    this.isOpen = false;
    this.setAttribute('aria-hidden', 'true');
    this.setAttribute('data-active', false);

    // Add closing class to trigger animation
    this.classList.add('is-closing');

    // Remove open attribute and closing class after animation
    setTimeout(() => {
      this.classList.remove('is-closing');
      enableBodyScroll();
    }, 300); // Match this duration with your CSS transition
  }

  async render() {
    const url = new URL(window.location.href);
    const text = await SectionsAPIService.fetch(url, this.sectionId, { cache: false });
    const minicartEl = parseHTML(text, 'site-minicart');
    this.innerHTML = minicartEl.innerHTML;
    const variation_editor = this.nextSibling;
    const updated_variant_editor = parseHTML(text, 'minicart-variant-editor');
    variation_editor.replaceWith(updated_variant_editor);

    // Reinitialize any new custom elements
    await this.reinitializeNewComponents(this);
  }

  async reinitializeNewComponents(context) {
    const components = context.querySelectorAll('[data-component]');

    for (const componentEl of components) {
      const { component } = componentEl.dataset;
      try {
        const module = await import(`~components/${component}/${component}.js`);

        if (typeof module.default === 'function') {
          // Call the initializer to define or reinitialize the component
          module.default();
        }
      } catch (err) {
        console.error(`Error reinitializing component ${component}:`, err);
      }
    }
  }

  async handleQuantityChange(e) {
    clearTimeout(this.debounce);
    if (e.target.name === 'quantity') {
      const key = e.target.closest('[data-line-item-key]').getAttribute('data-line-item-key');
      console.log(key);

      await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: { [key]: parseInt(e.target.value, 10) },
        }),
      });

      this.updateCartBadge();
      this.debounce = setTimeout(async () => await this.render(), 300);
    }
  }

  async handleRemoveClick(e) {
    clearTimeout(this.debounce);
    if (e.target.closest('[data-remove]')) {
      const lineItem = e.target.closest('[data-line-item]');
      // remove it immediately as an optimistic UI update
      lineItem.remove();
      const key = e.target.closest('[data-line-item-key]').getAttribute('data-line-item-key');
      await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: { [key]: 0 },
        }),
      });

      this.updateCartBadge();
      this.debounce = setTimeout(async () => await this.render(), 300);
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

export default () => {
  customElements.get('site-minicart') ||
    customElements.define('site-minicart', Minicart);
};
