import './sketchfab.scss';

import EVENTS from '@/helpers/events';
import SectionsAPIService from '@/helpers/sections-api-service';
import parseHTML from '@/helpers/parse-html';

class Sketchfab extends HTMLElement {
  constructor() {
    super();
    this.sectionId = this.getAttribute('data-section-id');
  }

  connectedCallback() {
    document.addEventListener(
      EVENTS.PRODUCT_VARIANT_UPDATE,
      this.handleProductVariantUpdate.bind(this),
    );
  }

  handleProductVariantUpdate(e) {
    const product = e?.detail?.product;
    const variant = e?.detail?.variant;
    this.product = product;
    this.currentVariant = variant;
    this.render();
  }

  async render() {
    if (this.product && this.currentVariant) {
      const url = new URL(
        `${window.location.origin}/products/${this.product.handle}?variant=${this.currentVariant.id}`,
      );
      const text = await SectionsAPIService.fetch(url, this.sectionId);
      const sketchfabEl = parseHTML(text, 'sketchfab-model');
      this.innerHTML = sketchfabEl.innerHTML;
    }
  }
}

export default () => {
  customElements.get('sketchfab-model') ||
    customElements.define('sketchfab-model', Sketchfab);
};
