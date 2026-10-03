import SwiperSlider from '@/helpers/swiper-slider';

import './enhanced-content-collection.scss';

class EnhancedContentCollection extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[data-slider]');
    this.init();
  }

  init() {
    if (!this.slider) return;

    const gap =
      window.getComputedStyle(this).getPropertyValue('--spacing-elements-group-gap-interactive') ||
      '8px';

    new SwiperSlider(this.slider, {
      slidesPerView: 'auto',
      spaceBetween: gap,
      slidesPerGroup: 1,
      loop: false,
      watchSlidesProgress: true,
      grabCursor: true,
      allowTouchMove: true,
      navigation: {
        prevEl: '[data-swiper-prev]',
        nextEl: '[data-swiper-next]',
      },
      breakpoints: {
        1025: {
          slidesPerGroup: 3,
          slidesPerView: 2.75,
        },
      },
    });
  }
}

export default () => {
  customElements.get('enhanced-content-collection') ||
    customElements.define('enhanced-content-collection', EnhancedContentCollection);
};
