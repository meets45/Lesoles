import SwiperSlider from '@/helpers/swiper-slider';
import './simple-blog-collection.scss';

class SimpleBlogCollection extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[data-slider]');
    this.init();
  }

  init() {
    if (!this.slider) return;

    const isMobile = window.innerWidth < 769;

    new SwiperSlider(this.slider, {
      slidesPerView: isMobile ? 1.2 : 3,
      slidesPerGroup: isMobile ? 1 : 3,
      spaceBetween: 20,
      watchSlidesProgress: true,
      scrollbar: {
        el: this.querySelector('[data-scrollbar]'),
        draggable: true,
        dragClass: 'simple-blog-collection__scrollbar-drag',
        dragSize: 'auto',
      },
      breakpoints: {
        769: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          spaceBetween: 20,
        },
      },
      on: {
        resize: function () {
          this.params.slidesPerView = window.innerWidth < 769 ? 1.2 : 3;
          this.params.slidesPerGroup = window.innerWidth < 769 ? 1 : 3;
          this.update();
        },
      },
    });
  }
}

export default () => {
  customElements.define('simple-blog-collection') ||
    customElements.define('simple-blog-collection', SimpleBlogCollection);
};
