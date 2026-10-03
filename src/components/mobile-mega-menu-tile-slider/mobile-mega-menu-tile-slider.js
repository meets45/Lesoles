import SwiperSlider from '@/helpers/swiper-slider';
import './mobile-mega-menu-tile-slider.scss';

class MobileMegaMenuTileSlider extends HTMLElement {
  constructor() {
    super();
    this.swiper = undefined;
  }

  connectedCallback() {
    const gap =
      window.getComputedStyle(this).getPropertyValue('--spacing-elements-group-gap-interactive') ||
      '8px';

    this.slider = new SwiperSlider(this, {
      slidesPerView: 'auto',
      spaceBetween: gap,
    });
  }
}

export default () => {
  customElements.get('mobile-mega-menu-tile-slider') ||
    customElements.define('mobile-mega-menu-tile-slider', MobileMegaMenuTileSlider);
};
