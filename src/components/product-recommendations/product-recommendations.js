import SwiperSlider from '@/helpers/swiper-slider';

import '@/components/simple-product-collection/simple-product-collection.scss';

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[data-slider]');
    this.init();
  }

  init() {
    // Fetch recommendations first
    this.loadRecommendations().then(() => {
      // Initialize slider after recommendations are loaded
      if (!this.slider) return;

      new SwiperSlider(this.slider, {
        slidesPerView: 'auto',
        slidesPerGroup: 1,
        watchSlidesProgress: true,
        scrollbar: {
          el: this.querySelector('[data-scrollbar]'),
          draggable: true,
          dragClass: 'simple-product-collection__scrollbar-drag',
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

  loadRecommendations() {
    const url = this.dataset.url;
    if (!url) return Promise.resolve();

    return fetch(url)
      .then(response => response.text())
      .then(text => {
        const html = new DOMParser()
          .parseFromString(text, 'text/html')
          .querySelector('product-recommendations');

        if (html && html.innerHTML.trim().length) {
          this.innerHTML = html.innerHTML;
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

export default () => {
  customElements.get('product-recommendations') ||
    customElements.define('product-recommendations', ProductRecommendations);
};
