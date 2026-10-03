import SwiperSlider from '@/helpers/swiper-slider';
import parseHTML from '@/helpers/parse-html';
import './product-search-card-slider.scss';

class ProductSearchCardSlider extends HTMLElement {
  constructor() {
    super();
    this.swiper = undefined;
    this.query = undefined;
    this.defaultTitle = this.getAttribute('data-title');
    this.dynamicTitle = this.getAttribute('data-dynamic-title');
    this.heading = this.querySelector('[data-heading]');
    // cache slides as a fallback state
    this.defaultSlides = this.querySelectorAll('.swiper-slide');
  }

  connectedCallback() {
    const gap = window.getComputedStyle(document.body).getPropertyValue('--spacing-200');
    this.swiper = new SwiperSlider(this, {
      slidesPerView: 'auto',
      spaceBetween: gap,
    })?.swiper;
  }

  async fetchProductSearchCards() {
    const res = await fetch(
      `${window.routes.search}?q=${this.query}&section_id=search-drawer-product-results`,
    );
    const text = await res.text();
    const slides = parseHTML(text, '.swiper-slide', true);
    return Array.from(slides);
  }

  setSlides(elements) {
    const slides = elements.map((element) => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      slide.appendChild(element);
      return slide;
    });
    this.swiper.removeAllSlides();
    this.swiper.appendSlide(slides);
    this.swiper.updateSlides();
    this.swiper.slideTo(0);

    if (elements?.length == 0) {
      this.active = false;
      this.setAttribute('data-active', false);
    } else {
      this.active = true;
      this.setAttribute('data-active', true);
    }

    // also update the title to the dynamic title
    this.setDynamicTitle();
  }

  setQuery(query) {
    this.query = query;
  }

  async render(query) {
    const productSearchCards = await this.fetchProductSearchCards(query);
    if (!productSearchCards?.length) {
      this.setAttribute('data-active', false);
    } else {
      this.setAttribute('data-active', true);
      this.setSlides(productSearchCards);
    }
  }

  setDefaultTitle() {
    this.heading.innerText = this.defaultTitle;
  }

  setDynamicTitle() {
    this.heading.innerText = this.dynamicTitle;
  }

  resetSlides() {
    this.swiper.removeAllSlides();
    this.swiper.appendSlide(this.defaultSlides);
    this.swiper.updateSlides();
    this.setAttribute('data-active', true);
  }

  reset() {
    this.query = undefined;
    this.setAttribute('data-active', true);
    this.resetSlides();
    this.setDefaultTitle();
  }
}

export default () => {
  customElements.get('product-search-card-slider') ||
    customElements.define('product-search-card-slider', ProductSearchCardSlider);
};
