import SwiperSlider from '@/helpers/swiper-slider';
import titleize from '@/helpers/titleize';
import './suggestion-chip-slider.scss';

class SuggestionChipSlider extends HTMLElement {
  constructor() {
    super();
    this.active = true;
    this.swiper = undefined;
    // this is namespaced because of the native title attribute
    this._title = this.querySelector('[data-title]');
    this.defaultTitle = this.title.innerText;
    // cache slides as a fallback state
    this.defaultSlides = this.querySelectorAll('.swiper-slide');
    this.suggestionChipTemplate = this.querySelector('[data-suggestion-chip-template]');
  }

  connectedCallback() {
    const gap = window.getComputedStyle(document.body).getPropertyValue('--spacing-200');
    this.swiper = new SwiperSlider(this, {
      slidesPerView: 'auto',
      spaceBetween: gap,
      keyboard: {
        enabled: true,
      },
    })?.swiper;
  }

  createSuggestionChip(term) {
    const chip = this.suggestionChipTemplate.querySelector('suggestion-chip').cloneNode(true);
    customElements.upgrade(chip);
    chip.setTerm(titleize(term));
    return chip;
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
  }

  setTerms(terms) {
    const chips = terms.map((term) => {
      return this.createSuggestionChip(term);
    });
    this.setSlides(chips);
  }

  resetSlides() {
    this.swiper.removeAllSlides();
    this.swiper.appendSlide(this.defaultSlides);
    this.swiper.updateSlides();
    this.setAttribute('data-active', true);
  }

  reset() {
    this.resetSlides();
  }

  setTitle(text) {
    this._title.innerText = text;
  }
}

export default () => {
  customElements.get('suggestion-chip-slider') ||
    customElements.define('suggestion-chip-slider', SuggestionChipSlider);
};
