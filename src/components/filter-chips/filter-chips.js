import './filter-chips.scss';

import EVENTS from '@/helpers/events';
import SectionsAPIService from '@/helpers/sections-api-service';
import parseHTML from '@/helpers/parse-html';

class FilterChips extends HTMLElement {
  constructor() {
    super();
    this.track = this.querySelector('[data-filter-chips]');
  }

  connectedCallback() {
    document.addEventListener(EVENTS.FILTER_UPDATE, this.render.bind(this));
    this.addEventListener('click', this.handleClearAllClick.bind(this));
    this.addEventListener('click', this.handleRemoveClick);
  }

  disconnectedCallback() {
    document.removeEventListener(EVENTS.FILTER_UPDATE, this.render.bind(this));
    this.removeEventListener('click', this.handleClearAllClick.bind(this));
    this.removeEventListener('click', this.handleRemoveClick);
  }

  handleRemoveClick(e) {
    if (e.target.closest('[data-filter-chip]')) {
      const filterChip = e.target.closest('[data-filter-chip]');

      clearTimeout(this.timer);
      const url = new URL(window.location.href);
      url.searchParams.delete(
        filterChip.getAttribute('data-filter-name'),
        filterChip.getAttribute('data-filter-value'),
      );
      window.history.replaceState(null, '', url);
      filterChip.remove();
      this.timer = setTimeout(
        () => document.dispatchEvent(new CustomEvent(EVENTS.FILTER_UPDATE)),
        1000,
      );
    }
  }

  handleClearAllClick(e) {
    if (e.target.closest('[data-clear-all]')) {
      Array.from(this.children).forEach((element) => element.remove());
      const url = new URL(`${window.location.origin}${window.location.pathname}`);
      window.history.replaceState(null, '', url);
      this.setAttribute('data-active', false);
      document.dispatchEvent(new CustomEvent(EVENTS.FILTER_UPDATE));
    }
  }

  async render() {
    const url = new URL(window.location.href);
    const text = await SectionsAPIService.fetch(url, 'main-product-grid');
    const filterChips = parseHTML(text, 'filter-chips');
    this.innerHTML = filterChips.innerHTML;
    const chips = filterChips.querySelectorAll('[data-filter-chip]');
    if (chips?.length > 0) {
      this.setAttribute('data-active', true);
    } else {
      this.setAttribute('data-active', false);
    }
  }
}

export default () => {
  customElements.get('filter-chips') || customElements.define('filter-chips', FilterChips);
}
