import './filters-facets.scss';

import EVENTS from '@/helpers/events';
import SectionsAPIService from '@/helpers/sections-api-service';
import { Header } from '@/components/header/header';
import parseHTML from '@/helpers/parse-html';

export class FiltersFacets extends HTMLElement {
  constructor() {
    super();
    this.url = new URL(window.location.href);
    this.filterInputs = this.querySelectorAll('[data-filter-input]');
    this.filterChips = document.querySelectorAll('[data-filter-chips]');
    this.applyButton = document.querySelector('[data-filter-apply]');
    this.timer = undefined;
  }

  connectedCallback() {
    Header.disableIdle = true;
    document.addEventListener(EVENTS.FILTER_UPDATE, this.render.bind(this));
    this.addEventListener('change', this.handleChange.bind(this));
    window.addEventListener('scroll', this.handleScroll.bind(this));
    document.addEventListener(EVENTS.SEARCH_UPDATE, this.handleSearchUpdate.bind(this));
  }

  disconnectedCallback() {
    Header.disableIdle = false;
    document.removeEventListener(EVENTS.FILTER_UPDATE, this.render.bind(this));
    this.removeEventListener('change', this.handleChange.bind(this));
    window.removeEventListener('scroll', this.handleScroll.bind(this));
    document.removeEventListener(EVENTS.SEARCH_UPDATE, this.handleSearchUpdate.bind(this));
  }

  handleScroll() {
    const { top } = this.getBoundingClientRect();
    if (top <= 0) {
      this.setAttribute('data-is-scrolled', true);
    } else this.setAttribute('data-is-scrolled', false);
  }

  handleChange(e) {
    clearTimeout(this.timer);
    const name = e.target.name;
    const value = e.target.value;
    const checked = e.target.checked;

    const url = new URL(window.location.href);
    if (e.target instanceof HTMLInputElement) {
      if (e.target.type == 'checkbox') {
        if (checked) {
          url.searchParams.append(name, value);
        } else {
          url.searchParams.delete(name, value);
        }
      }
      if (e.target.type === 'number') {
        url.searchParams.set(name, value);
      }
    }

    if (e.target instanceof HTMLSelectElement) {
      url.searchParams.append(name, value);
    }

    window.history.replaceState(null, '', url);

    this.timer = setTimeout(() => {
      document.dispatchEvent(new CustomEvent(EVENTS.FILTER_UPDATE));
      console.log('filter update');
    }, 200);
  }

  /** this totally replaces the contents of the component,
   *  because the filters available may be radically different depending on the search query
   */
  async handleSearchUpdate() {
    const url = new URL(window.location.href);
    const text = await SectionsAPIService.fetch(url, 'main-product-grid');
    const nextFiltersFacets = parseHTML(text, 'filters-facets');
    this.innerHTML = nextFiltersFacets.innerHTML;
  }

  async render() {
    // get the current URL
    const url = new URL(window.location.href);
    // get the markup for the inputs from the sections API
    const text = await SectionsAPIService.fetch(url, 'main-product-grid');
    const nextFilterInputs = parseHTML(text, 'filters-facets [data-filter-input]', true);
    // for each input, go looking for the input with the same ID in the markup
    this.filterInputs.forEach((filterInput) => {
      // the actual filter element
      const input = filterInput.querySelector('input');
      const count = filterInput.querySelector('[data-count]');
      // set the state of the input based on its state in the fetched markup
      const nextFilterInput = Array.from(nextFilterInputs).find(
        (ni) => ni?.querySelector('input')?.id === input?.id,
      );

      const nextInput = nextFilterInput?.querySelector('input');
      const nextCount = nextFilterInput?.querySelector('[data-count]');

      if (input && nextInput) {
        input.checked = nextInput.checked;
        input.disabled = nextInput.disabled;
      }
      if (count && nextCount) {
        count.innerText = nextCount.innerText;
      }
    });
  }
}

export default () => {
  customElements.get('filters-facets') || customElements.define('filters-facets', FiltersFacets);
};
