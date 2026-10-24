import SwiperSlider from '@/helpers/swiper-slider';
import './simple-product-collection.scss';

class SimpleProductCollection extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[data-slider]');
    this.desktopGap = Number(this.dataset.desktopGap) || 0;
    this.disableMobileSlider = this.dataset.disableMobileSlider === 'true';
    this.loop = this.dataset.loop === 'true';
    this.mobileGap = Number(this.dataset.mobileGap) || 0;
    this.mobileSmoothScroll = this.dataset.mobileSmoothScroll === 'true';
    this.slidesPerView = Number(this.dataset.slidesPerView) || 4;
    this.slidesPerViewMobile = Number(this.dataset.slidesPerViewMobile) || 1.2;
    this.init();
  }

  init() {
    if (!this.slider) return;

    const scrollbar = this.querySelector('[data-scrollbar]');

    new SwiperSlider(this.slider, {
      enabled: !this.disableMobileSlider,
      slidesPerView: this.slidesPerViewMobile,
      slidesPerGroup: 1,
      spaceBetween: this.mobileGap,
      loop: this.disableMobileSlider ? false : this.loop,
      // Keep groups complete so loop mode can move in either direction.
      loopAddBlankSlides: true,
      watchSlidesProgress: true,
      freeMode: {
        enabled: this.mobileSmoothScroll,
      },
      ...(scrollbar && {
        scrollbar: {
          el: scrollbar,
          draggable: true,
          dragClass: 'simple-product-collection__scrollbar-drag',
          dragSize: 'auto',
        },
      }),
      breakpoints: {
        769: {
          enabled: true,
          loop: this.loop,
          slidesPerGroup: Math.floor(this.slidesPerView),
          slidesPerView: this.slidesPerView,
          spaceBetween: this.desktopGap,
          freeMode: false,
        },
      },
    });
  }
}

export default () => {
  customElements.get('simple-product-collection') ||
    customElements.define('simple-product-collection', SimpleProductCollection);
};
