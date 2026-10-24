import SwiperSlider from '@/helpers/swiper-slider';
import './simple-content-collection.scss';

class SimpleContentCollection extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[data-slider]');
    this.desktopGap = Number(this.dataset.desktopGap) || 0;
    this.disableMobileSlider = this.dataset.disableMobileSlider === 'true';
    this.mobileGap = Number(this.dataset.mobileGap) || 0;
    this.slidesPerViewDesktop = Number(this.dataset.slidesPerViewDesktop) || 3.1;
    this.slidesPerViewMobile = Number(this.dataset.slidesPerViewMobile) || 1.1;
    this.init();
  }

  init() {
    if (!this.slider) return;

    const slides = this.querySelectorAll('.swiper-slide');
    const controls = this.querySelector('[data-swiper-controls]');
    const pagination = this.querySelector('[data-swiper-pagination]');
    const scrollbar = this.querySelector('[data-scrollbar]');

    if (slides.length < 2) {
      controls?.classList.add('hidden');
      scrollbar?.classList.add('hidden');
      return;
    }

    new SwiperSlider(this.slider, {
      enabled: !this.disableMobileSlider,
      slidesPerView: this.slidesPerViewMobile,
      slidesPerGroup: 1,
      spaceBetween: this.mobileGap,
      watchOverflow: true,
      ...(pagination && {
        pagination: {
          el: pagination,
          clickable: true,
        },
      }),
      ...(scrollbar && {
        scrollbar: {
          el: scrollbar,
          draggable: true,
          dragClass: 'simple-content-collection__scrollbar-drag',
          dragSize: 'auto',
        },
      }),
      breakpoints: {
        769: {
          enabled: true,
          slidesPerView: this.slidesPerViewDesktop,
          slidesPerGroup: Math.floor(this.slidesPerViewDesktop),
          spaceBetween: this.desktopGap,
        },
      },
      on: {
        lock: () => {
          controls?.classList.add('hidden');
          scrollbar?.classList.add('hidden');
        },
        unlock: () => {
          controls?.classList.remove('hidden');
          scrollbar?.classList.remove('hidden');
        },
      },
    });
  }
}

export default () => {
  customElements.get('simple-content-collection') ||
    customElements.define('simple-content-collection', SimpleContentCollection);
};
