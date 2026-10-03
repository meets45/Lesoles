import { createFocusTrap } from 'focus-trap';
import { disableBodyScroll, enableBodyScroll } from '@/helpers/body-scroll';

class SearchDrawer extends HTMLElement {
  constructor() {
    super();
    this.active = false;
    this.resources = undefined;
    this.inputTimer = undefined;
    this.closeTimer = undefined;
    this.openTriggers = document.querySelectorAll('[data-search-drawer-trigger]');
    this.closeTrigger = this.querySelector('[data-close]');
    this.input = this.querySelector('input');
    this.linksLists = this.querySelectorAll('[data-search-drawer-link-list]');
    this.suggestionChipSlider = this.querySelector('[data-suggestion-chip-slider]');
    this.productSearchCardSlider = this.querySelector('[data-product-search-card-slider]');
    this.trap = createFocusTrap(this);
  }

  connectedCallback() {
    this.openTriggers.forEach((t) => t.addEventListener('click', this.handleClick.bind(this)));
    this.closeTrigger.addEventListener('click', this.close.bind(this));
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.addEventListener('click', this.handleSuggestionClick.bind(this));
    this.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  disconnectedCallback() {
    this.openTriggers.forEach((t) => t.removeEventListener('click', this.handleClick.bind(this)));
    this.closeTrigger.removeEventListener('click', this.close.bind(this));
    this.input.removeEventListener('input', this.handleInput.bind(this));
    this.removeEventListener('click', this.handleSuggestionClick.bind(this));
    this.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  open() {
    this.active = true;
    this.style.display = 'block';
    this.input.focus();
    if (window.innerWidth < 769) {
      this.trap.activate();
      disableBodyScroll();
    }

    setTimeout(() => this.setAttribute('data-active', true), 100);
  }

  close() {
    this.active = false;
    this.trap.deactivate();
    this.setAttribute('data-active', false);
    enableBodyScroll();
    setTimeout(() => (this.style.display = 'none'), 100);
  }

  createLinks() {
    const collectionLinks = this.resources?.results.collections?.map((c) => ({
      text: c.title,
      url: c.url,
    }));

    const pageLinks = this.resources?.results.pages?.map((p) => ({
      text: p.title,
      url: p.url,
    }));

    return [...collectionLinks, ...pageLinks];
  }

  async render() {
    if (this.resources) {
      this.productSearchCardSlider.setQuery(this.query);
      await this.productSearchCardSlider.render();
      const terms = this.resources.results.queries.map((query) => query.text);
      this.suggestionChipSlider.setTerms(terms);

      const links = this.createLinks();
      this.linksLists.forEach((ll) => ll.setLinks(links));
    } else {
      this.suggestionChipSlider.reset();
      this.productSearchCardSlider.reset();
      this.linksLists.forEach((ll) => ll.reset());
    }
  }

  async search() {
    if (this.query != '') {
      const searchPath = `${window.routes.predictive_search_url}.json?q=${encodeURIComponent(this.query)}`;
      const res = await fetch(searchPath);
      const json = await res.json();
      this.resources = json?.resources;
      this.render();
    } else {
      this.resources = undefined;
      this.render();
    }
  }

  handleClick() {
    if (!this.active) {
      this.open();
      this.openTriggers.forEach((t) => t.setAttribute('aria-expanded', true));
    } else {
      this.close();
      this.openTriggers.forEach((t) => t.setAttribute('aria-expanded', false));
    }
  }

  handleInput(e) {
    clearTimeout(this.inputTimer);
    const query = e.target.value;
    this.query = query;
    this.inputTimer = setTimeout(() => this.search(), 500);
  }

  handleSuggestionClick(e) {
    if (e.target.closest('[data-suggestion]')) {
      const term = e.target.closest('[data-suggestion]').getAttribute('data-term');
      this.input.value = term;
      this.input.dispatchEvent(new Event('input'));
    }
  }

  handleResize() {
    if (this.active && window.innerWidth >= 769) {
      this.trap.deactivate();
      enableBodyScroll();
    }
  }

  handleMouseLeave() {
    this.closeTimer = setTimeout(this.close.bind(this), 500);
  }
}

export default () => {
  customElements.get('search-drawer') ||
    customElements.define('search-drawer', SearchDrawer);
};
