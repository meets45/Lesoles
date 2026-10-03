import SwiperSlider from '@/helpers/swiper-slider';

import './product-content-sections.scss';

class ProductContentSections extends HTMLElement {
  constructor() {
    super();
    this.swipers = [];
  }

  connectedCallback() {
    const gap = window.getComputedStyle(this).getPropertyValue('--spacing-200') || '8px';

    const cardSliders = this.querySelectorAll('[data-card-slider]');
    cardSliders.forEach((slider) => {
      try {
        this.swipers.push(
          new SwiperSlider(slider, {
            slidesPerView: 1.3,
            spaceBetween: gap,
            centerInsufficientSlides: true,
            breakpoints: {
              1000: {
                slidesPerView: 4,
              },
            },
          }),
        );
      } catch (error) {
        console.error(error);
      }
    });
  }

  disconnectedCallback() {}
}

export default () => {
  customElements.define('product-content-sections') ||
    customElements.define('product-content-sections', ProductContentSections);
};
