import SwiperSlider from '@/helpers/swiper-slider';
import './icon-with-text.scss';

class IconWithText extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[data-slider]');
    this.layoutStyle = this.dataset.layoutStyle;
    this.benefitsItemsPerView = Number(this.dataset.benefitsItemsPerView) || 3;
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
          dragClass: 'icon-with-text__scrollbar-drag',
          dragSize: 'auto',
        },
      }),
      breakpoints: {
        769: {
          enabled: true,
          slidesPerView:
            this.layoutStyle === 'benefits_bar' ? this.benefitsItemsPerView : this.slidesPerViewDesktop,
          slidesPerGroup: Math.floor(
            this.layoutStyle === 'benefits_bar' ? this.benefitsItemsPerView : this.slidesPerViewDesktop,
          ),
          spaceBetween: this.layoutStyle === 'benefits_bar' ? 0 : this.desktopGap,
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
  customElements.get('icon-with-text') || customElements.define('icon-with-text', IconWithText);
};
