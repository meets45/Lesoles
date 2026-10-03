import './product-price.scss';

import { Shopify } from '@/helpers/globals';
import formatCurrency from '@/helpers/format-currency';

class ProductPrice extends HTMLElement {
  constructor() {
    super();
    this.price = this.querySelector('[data-price]');
    this.compareAtPrice = this.querySelector('[data-compare-at-price]');
    this.savings = this.querySelector('[data-savings]');
  }

  setPrice(price) {
    if (this.price) {
      if (price) {
        this.price.innerText = formatCurrency(
          price / 100,
          `${Shopify.locale}-${Shopify.country}`,
          Shopify.currency.active,
        );
        this.price.setAttribute('data-active', true);
      } else {
        this.price.innerText = '';
        this.price.setAttribute('data-active', false);
      }
    }
  }

  setCompareAtPrice(price, compareAtPrice) {
    if (this.compareAtPrice) {
      if (price && compareAtPrice && price !== compareAtPrice && compareAtPrice > price) {
        this.compareAtPrice.innerText = formatCurrency(
          compareAtPrice / 100,
          `${Shopify.locale}-${Shopify.country}`,
          Shopify.currency.active,
        );
        this.savings.setAttribute('data-active', true);
      } else {
        this.compareAtPrice.innerText = '';
        this.savings.setAttribute('data-active', false);
      }
    }
  }

  setSavings(price, compareAtPrice) {
    if (this.savings) {
      if (price && compareAtPrice && price !== compareAtPrice && compareAtPrice > price) {
        this.savings.innerText = `${Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}% off`;
        this.savings.setAttribute('data-active', true);
      } else {
        this.savings.innerText = '';
        this.savings.setAttribute('data-active', false);
      }
    }
  }
}

export default () => {
  customElements.get('product-price') ||
    customElements.define('product-price', ProductPrice);
};
