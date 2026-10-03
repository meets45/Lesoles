import SwiperSlider from '@/helpers/swiper-slider';
import EVENTS from '@/helpers/events';
import './promo-bar.scss';

class PromoBar extends HTMLElement {
  constructor() {
    super();
    this.setHeaderOffset();
    this.slider = new SwiperSlider(this, {
      loop: true,
      autoplay: this.getAttribute('autoplay') === 'true' ? true : false,
    });
  }

  connectedCallback() {
    window.addEventListener('resize', this.setHeaderOffset.bind(this));
    window.addEventListener(EVENTS.SHOPIFY_SECTION_LOAD, this.setHeaderOffset.bind(this));
  }

  disconnectedCallback() {
    window.addEventListener('resize', this.setHeaderOffset.bind(this));
    window.removeEventListener(EVENTS.SHOPIFY_SECTION_LOAD, this.setHeaderOffset.bind(this));
  }

  setHeaderOffset() {
    const style = document.createElement('style');
    style.innerHTML = `:root{ --header-top-offset: ${this.getBoundingClientRect()?.height}px }`;
    document.head.appendChild(style);
  }
}

export default () => {
  customElements.get('promo-bar') || customElements.define('promo-bar', PromoBar);
}
