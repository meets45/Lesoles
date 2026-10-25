import SwiperSlider from '@/helpers/swiper-slider';
import './visual-filters.scss';

class VisualFilters extends HTMLElement {
  constructor() {
    super();
    this.swiper = undefined;
  }

  connectedCallback() {
    this.highlightActiveLinks();

    if (this.dataset.filterType === 'graphics' && this.querySelector('[data-swiper]')) {
      this.initSwiper();
    }
  }

  disconnectedCallback() {
    this.swiper?.destroy(true, true);
    this.swiper = undefined;
  }

  initSwiper() {
    if (this.swiper) return;

    const slidesPerViewMobile = Number.parseFloat(this.dataset.slidesPerViewMobile) || 2.3;
    const slidesPerViewDesktop = Number.parseFloat(this.dataset.slidesPerViewDesktop) || 6;
    const spaceBetween = Number.parseFloat(this.dataset.spaceBetween) || 0;
    const slidesOffsetBefore = Number.parseFloat(this.dataset.slidesOffsetBefore) || 0;
    const slidesOffsetAfter = Number.parseFloat(this.dataset.slidesOffsetAfter) || 0;

    this.swiper = new SwiperSlider(this, {
      slidesPerView: slidesPerViewMobile,
      slidesPerGroup: 1,
      spaceBetween,
      slidesOffsetBefore,
      slidesOffsetAfter,
      centerInsufficientSlides: true,
      watchOverflow: true,
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      breakpoints: {
        769: {
          slidesPerView: slidesPerViewDesktop,
          slidesPerGroup: 1,
          spaceBetween,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 0,
        },
      },
    })?.swiper;
  }

  highlightActiveLinks() {
    const currentUrl = new URL(window.location.href);

    this.querySelectorAll('[data-visual-filter-link]').forEach((link) => {
      const linkUrl = new URL(link.href, currentUrl.origin);
      const matchesPath = linkUrl.origin === currentUrl.origin && linkUrl.pathname === currentUrl.pathname;
      const matchesQuery = Array.from(linkUrl.searchParams.entries()).every(([key, value]) =>
        currentUrl.searchParams.getAll(key).includes(value),
      );
      const isActive = matchesPath && matchesQuery;

      link.classList.toggle('is-active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
}

export default () => {
  customElements.get('visual-filters') || customElements.define('visual-filters', VisualFilters);
};
