import SwiperSlider from '@/helpers/swiper-slider';
import './promo-bar.scss';

class PromoBar extends HTMLElement {
  constructor() {
    super();
    this.resizeObserver = new ResizeObserver(() => this.setHeaderOffset());
  }

  connectedCallback() {
    this.resizeObserver.observe(this);
    this.setHeaderOffset();

    if (Number(this.dataset.slideCount) > 1) {
      this.slider = new SwiperSlider(this, {
        loop: true,
        autoplay: this.dataset.autoplay === 'true',
      });
    }
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect();
    this.slider?.swiper?.destroy();
    document.documentElement.style.setProperty('--header-top-offset', '0px');
  }

  setHeaderOffset() {
    document.documentElement.style.setProperty('--header-top-offset', `${this.getBoundingClientRect().height}px`);
  }
}

export default () => {
  customElements.get('promo-bar') || customElements.define('promo-bar', PromoBar);
};
