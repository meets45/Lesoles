import SwiperSlider from '@/helpers/swiper-slider';
import './simple-product-collection.scss';

class SimpleProductCollection extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[data-slider]');
    this.init();
  }

  init() {
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
  }
}

export default () => {
  customElements.get('simple-product-collection') ||
    customElements.define('simple-product-collection', SimpleProductCollection);
};
