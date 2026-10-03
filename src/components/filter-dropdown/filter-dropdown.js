import './filter-dropdown.scss';

class FilterDropdown extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.openLabel = window.strings.products.facets.open_filter;
    this.closeLabel = window.strings.products.facets.close_filter;
  }

  connectedCallback() {
    this.toggleTrigger = this.querySelector('[data-dropdown-toggle]');
    this.content = this.querySelector('[data-dropdown-content]');

    if (!this.toggleTrigger || !this.content) return;

    this.toggleTrigger.addEventListener('click', this.handleClick);
    document.addEventListener('click', this.handleClickOutside);
  }

  disconnectedCallback() {
    if (this.toggleTrigger) {
      this.toggleTrigger.removeEventListener('click', this.handleClick);
    }
    document.removeEventListener('click', this.handleClickOutside);
  }

  handleClick(e) {
    e.stopPropagation();
    this.toggle();
  }

  handleClickOutside(e) {
    if (!this.contains(e.target) && this.dataset.active === 'true') {
      this.close();
    }
  }

  open() {
    this.setAttribute('data-active', 'true');
    this.toggleTrigger?.setAttribute('aria-expanded', 'true');
    this.toggleTrigger?.setAttribute('aria-label', this.closeLabel);
  }

  close() {
    this.setAttribute('data-active', 'false');
    this.toggleTrigger?.setAttribute('aria-expanded', 'false');
    this.toggleTrigger?.setAttribute('aria-label', this.openLabel);
  }

  toggle() {
    if (this.dataset.active === 'false') {
      this.open();
    } else {
      this.close();
    }
  }
}

export default () => {
  customElements.get('filter-dropdown') ||
    customElements.define('filter-dropdown', FilterDropdown);
}
