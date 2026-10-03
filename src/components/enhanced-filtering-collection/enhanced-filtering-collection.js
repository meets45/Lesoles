import './enhanced-filtering-collection.scss';

import EVENTS from '@/helpers/events';

class EnhancedFilteringCollection extends HTMLElement {
  constructor() {
    super();
    this.filterButtons = this.querySelectorAll('[data-filter-button]');
    this.init();
  }

  init() {
    this.initSlider();
    this.initFilterButtons();
    this.setActiveFilters();
  }

  initSlider() {
    if (!this.filterSlider || window.innerWidth >= 1025) return;
  }

  initFilterButtons() {
    this.filterButtons.forEach((button) => {
      button.addEventListener('click', (e) => this.handleFilterClick(e));
    });
  }

  setActiveFilters() {
    const params = new URLSearchParams(window.location.search);
    this.filterButtons.forEach((button) => {
      const param = button.dataset.filterParam;
      const value = button.dataset.filterValue;

      // Check if this filter is active
      const isActive = Array.from(params.entries()).some(
        ([key, val]) => key === param && val === value,
      );

      button.classList.toggle('is-active', isActive);
    });
  }

  handleFilterClick(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const param = button.dataset.filterParam;
    const value = button.dataset.filterValue;

    // Get current URL parameters
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // Check if this filter is already applied
    const existingValues = params.getAll(param);
    const isActive = existingValues.includes(value);
    if (isActive) {
      // Remove this filter
      const newValues = existingValues.filter((val) => val !== value);
      params.delete(param);
      newValues.forEach((val) => params.append(param, val));
      button.classList.remove('is-active');
    } else {
      // Add this filter
      params.append(param, value);
      button.classList.add('is-active');
    }

    // Update URL without page reload
    const newUrl = `${window.location.pathname}${params.toString() ? '?' : ''}${params.toString()}`;
    window.history.replaceState(null, '', newUrl);

    // Dispatch filter update event to trigger the collection refresh
    document.dispatchEvent(new CustomEvent(EVENTS.FILTER_UPDATE));
  }
}

export default () => {
  customElements.define('enhanced-filtering-collection') ||
    customElements.define('enhanced-filtering-collection', EnhancedFilteringCollection);
};
