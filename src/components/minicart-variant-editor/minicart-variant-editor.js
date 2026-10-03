import './minicart-variant-editor.scss';

import EVENTS from '@/helpers/events';
import SectionsAPIService from '@/helpers/sections-api-service';
import parseHTML from '@/helpers/parse-html';
import { ProductForm } from '@/components/product-form/product-form';
import variantCollection from '../variant-collection/variant-collection';

class MinicartVariantEditor extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;

    // Bind methods
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);

    // Get elements
    this.overlay = this.querySelector('.minicart-variant-editor__overlay');
    this.drawer = this.querySelector('.minicart-variant-editor__drawer');
    this.content = this.querySelector('.minicart-variant-editor__content');
  }

  connectedCallback() {
    this.overlay?.addEventListener('click', this.close);
    document.addEventListener('keyup', this.handleKeyup);
    document.addEventListener('click', this.handleOpenClick.bind(this));
    this.addEventListener('click', this.handleCloseClick.bind(this));
    document.addEventListener(EVENTS.CART_UPDATE, this.close.bind(this));
  }

  disconnectedCallback() {
    this.overlay?.removeEventListener('click', this.close);
    document.removeEventListener('keyup', this.handleKeyup);
    document.removeEventListener('click', this.handleOpenClick.bind(this));
    this.removeEventListener('click', this.handleCloseClick.bind(this));
    document.removeEventListener(EVENTS.CART_UPDATE, this.close.bind(this));
  }

  async handleOpenClick(e) {
    if (e.target.closest('[data-variant-editor-open]')) {
      const lineItemKey = e.target.getAttribute('data-line-item-key');
      const currentVariantEditor = this
        .querySelector(`variant-editor[data-line-item-key="${lineItemKey}"]`);

      Array
        .from(this.querySelectorAll('variant-editor'))
        .filter((variantEditor) => variantEditor !== currentVariantEditor)
        .forEach((variantEditor) => variantEditor.style.display = 'none')
      ;
      currentVariantEditor.style.display = '';

      this.open();
    }
  }

  handleCloseClick(e) {
    if (e.target.closest('[data-close]')) {
      this.close();
    }
  }

  handleKeyup(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  open() {
    this.isOpen = true;

    // Always animate the drawer
    requestAnimationFrame(() => {
      document.documentElement.classList.add('minicart-variant-editor-open');
      this.classList.add('is-active');
      this.setAttribute('data-active', true);

      // Only add is-active to overlay if minicart is not open
      const miniCart = document.querySelector('minicart');
      if (!miniCart?.hasAttribute('open')) {
        this.overlay?.classList.add('is-active');
      }
    });
    this.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.isOpen = false;

    this.classList.remove('is-active');
    this.overlay?.classList.remove('is-active');
    this.setAttribute('data-active', false);
    this.setAttribute('aria-hidden', 'true');
  }
}

class VariantEditor extends ProductForm {
  constructor() {
    super();
    this.lineItemKey = this.getAttribute('data-line-item-key');
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (this.lineItemKey) {
      const formData = new FormData(e.target);
      const id = formData.get('id');
      const quantity = formData.get('quantity');
      const oldVariantId = typeof this.lineItemKey === 'string' ? this.lineItemKey.split(':')[0] : '';

      const updates = {
        // remove the line item
        ...(oldVariantId ? { [oldVariantId]: 0 } : {}),
        // replace it with a new item
        [id]: parseInt(quantity, 10),
      };

      const res = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      if (res.ok) {
        document.dispatchEvent(new CustomEvent(EVENTS.CART_UPDATE));
      }
    }
  }
}

class VariantImage extends HTMLElement {
  constructor() {
    super();
    this.img = this.querySelector('img');
    this.width = this.img?.getAttribute('width');
    this.height = this.img?.getAttribute('height');
  }

  connectedCallback() {
    this.addEventListener(
      EVENTS.PRODUCT_VARIANT_UPDATE,
      this.handleProductVariantUpdate.bind(this),
    );
  }

  disconnectedCallback() {
    this.removeEventListener(
      EVENTS.PRODUCT_VARIANT_UPDATE,
      this.handleProductVariantUpdate.bind(this),
    );
  }

  setImage(src) {
    const url = new URL(src);
    url.searchParams.set('width', this.width);
    if (this.img) {
      this.img.src = url.toString();
      this.img.removeAttribute('srcset');
    }
  }

  handleProductVariantUpdate(e) {
    const { variant } = e.detail;
    if (variant?.featured_image?.src) {
      this.setImage(`https:${variant.featured_image.src}`);
    }
  }

  render() {}
}

export default () => {
  customElements.get('minicart-variant-editor') ||
    customElements.define('minicart-variant-editor', MinicartVariantEditor);

  customElements.get('variant-editor') ||
    customElements.define('variant-editor', VariantEditor);

  customElements.get('variant-image') ||
    customElements.define('variant-image', VariantImage);
};
