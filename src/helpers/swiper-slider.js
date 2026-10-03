import 'swiper/swiper-bundle.css';
import {
  A11y,
  Autoplay,
  Keyboard,
  Manipulation,
  Navigation,
  Pagination,
  Scrollbar,
} from 'swiper/modules';
import Swiper from 'swiper';
import setTabIndexes from './set-tab-indexes';

/**
 * This is a reusable slider component that includes some accessibility features built on top of Swiper
 * @param slider
 * @param config @type {Swiper.config}
 */
class SwiperSlider {
  constructor(slider, config) {
    this.slider = slider;
    this.prev = slider.querySelector('[data-swiper-prev]');
    this.next = slider.querySelector('[data-swiper-next]');

    // if there's no prev or next elements, then we'll need to create fallbacks
    // TODO create fallbacks

    this.swiper = new Swiper(slider.querySelector('[data-swiper]'), {
      autoplay: false,
      modules: [Navigation, A11y, Pagination, Scrollbar, Autoplay, Manipulation, Keyboard],
      ...config,
      navigation: {
        // Always spread, then use prevEl and nextEl if provided
        ...config?.navigation,
        prevEl: this.prev,
        nextEl: this.next,
      },
      on: {
        slideChangeTransitionEnd: (swiper) => this.handleSlideChangeTransitionEnd(swiper),
        ...config?.on,
      },
      watchSlidesProgress: true,
    });
    this.init();
  }

  setSlideVisibility() {
    if (this.swiper?.slides) {
      this.swiper?.slides?.forEach((s) => {
        if (
          s.classList.contains('swiper-slide-fully-visible') ||
          s.classList.contains('swiper-slide-active')
        ) {
          setTabIndexes(s, 0);
          s.removeAttribute('aria-hidden');
        } else {
          setTabIndexes(s, -1);
          s.setAttribute('aria-hidden', true);
        }
      });
    }
  }

  init() {
    // add any required aria attributes
    this.slider.setAttribute('role', 'group');
    this.setSlideVisibility();
  }

  handleSlideChangeTransitionEnd() {
    this.setSlideVisibility();
  }
}

export default SwiperSlider;
