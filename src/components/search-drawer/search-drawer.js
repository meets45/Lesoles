import { createFocusTrap } from 'focus-trap';
import { disableBodyScroll, enableBodyScroll } from '@/helpers/body-scroll';
import './search-drawer.scss';

class SearchDrawer extends HTMLElement {
  constructor() {
    super();
    this.active = false;
    this.mobileMode = false;
    this.query = '';
    this.inputTimer = undefined;
    this.searchController = undefined;

    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleDocumentPointerDown = this.handleDocumentPointerDown.bind(this);
    this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  connectedCallback() {
    this.openTriggers = [...document.querySelectorAll('[data-search-drawer-trigger]')];
    this.closeTrigger = this.querySelector('[data-close]');
    this.form = this.querySelector('form');
    this.input = this.querySelector('input[name="q"]');
    this.quickLinks = this.querySelector('[data-search-quick-links]');
    this.status = this.querySelector('[data-search-status]');
    this.results = this.querySelector('[data-search-results]');
    this.viewAll = this.querySelector('[data-search-view-all]');
    this.trap = createFocusTrap(this, {
      initialFocus: () => this.input,
      fallbackFocus: () => this.closeTrigger,
      escapeDeactivates: false,
      returnFocusOnDeactivate: false,
    });

    this.openTriggers.forEach((trigger) => trigger.addEventListener('click', this.handleTriggerClick));
    this.closeTrigger?.addEventListener('click', this.handleCloseClick);
    this.input?.addEventListener('input', this.handleInput);
    document.addEventListener('pointerdown', this.handleDocumentPointerDown);
    document.addEventListener('keydown', this.handleDocumentKeyDown);
    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback() {
    this.openTriggers?.forEach((trigger) => trigger.removeEventListener('click', this.handleTriggerClick));
    this.closeTrigger?.removeEventListener('click', this.handleCloseClick);
    this.input?.removeEventListener('input', this.handleInput);
    document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
    window.removeEventListener('resize', this.handleResize);
    clearTimeout(this.inputTimer);
    this.searchController?.abort();
    this.trap?.deactivate({ returnFocus: false });
    if (this.mobileMode) enableBodyScroll();
  }

  syncViewportMode() {
    const mobile = window.innerWidth <= 768;
    this.setAttribute('aria-modal', String(mobile));
    if (mobile === this.mobileMode) return;

    this.mobileMode = mobile;
    if (mobile) {
      disableBodyScroll();
      this.trap.activate();
    } else {
      this.trap.deactivate({ returnFocus: false });
      enableBodyScroll();
    }
  }

  open(trigger) {
    if (this.active) return;
    this.active = true;
    this.lastTrigger = trigger;
    this.style.display = 'block';
    this.dataset.active = 'true';
    this.setAttribute('aria-hidden', 'false');
    this.openTriggers.forEach((button) => button.setAttribute('aria-expanded', 'true'));
    this.syncViewportMode();
    if (!this.mobileMode) this.input?.focus();
  }

  close({ returnFocus = true } = {}) {
    if (!this.active) return;
    this.active = false;
    clearTimeout(this.inputTimer);
    this.searchController?.abort();
    if (this.mobileMode) {
      this.trap.deactivate({ returnFocus: false });
      enableBodyScroll();
      this.mobileMode = false;
    }
    this.style.display = 'none';
    this.dataset.active = 'false';
    this.setAttribute('aria-hidden', 'true');
    this.setAttribute('aria-modal', 'false');
    this.openTriggers.forEach((button) => button.setAttribute('aria-expanded', 'false'));
    if (returnFocus) this.lastTrigger?.focus();
  }

  handleTriggerClick(event) {
    if (this.active) this.close();
    else this.open(event.currentTarget);
  }

  handleCloseClick() {
    this.close();
  }

  handleDocumentPointerDown(event) {
    if (!this.active || this.contains(event.target)) return;
    if (this.openTriggers.some((trigger) => trigger.contains(event.target))) return;
    this.close({ returnFocus: false });
  }

  handleDocumentKeyDown(event) {
    if (!this.active || event.key !== 'Escape') return;
    event.preventDefault();
    this.close();
  }

  handleResize() {
    if (this.active) this.syncViewportMode();
  }

  handleInput() {
    clearTimeout(this.inputTimer);
    this.searchController?.abort();
    this.query = this.input.value.trim();
    this.status.textContent = '';
    this.results.hidden = true;
    if (this.quickLinks) this.quickLinks.hidden = this.query !== '';
    if (!this.query) return;
    this.inputTimer = setTimeout(() => this.search(this.query), 300);
  }

  searchHref(query) {
    const url = new URL(this.form.action, window.location.origin);
    url.searchParams.set('q', query);
    return url.toString();
  }

  async search(query) {
    const controller = new AbortController();
    this.searchController = controller;
    const url = new URL(window.routes.predictive_search_url || '/search/suggest', window.location.origin);
    if (!url.pathname.endsWith('.json')) url.pathname += '.json';
    url.searchParams.set('q', query);
    url.searchParams.set('resources[type]', 'product,query,collection,page');
    url.searchParams.set('resources[limit]', '4');

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('Search request failed');
      const data = await response.json();
      if (query === this.query && this.active) this.renderResults(data.resources?.results || {}, query);
    } catch (error) {
      if (error.name !== 'AbortError' && query === this.query && this.active) {
        this.status.textContent = this.dataset.errorText;
      }
    }
  }

  textResult(text, href) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    item.appendChild(link);
    return item;
  }

  productResult(product) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'search-drawer__product-card';
    link.href = product.url;
    const image = document.createElement('span');
    image.className = 'search-drawer__product-image';
    const imageUrl = product.featured_image?.url || product.image?.url || product.image;
    if (typeof imageUrl === 'string' && imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = '';
      img.loading = 'lazy';
      image.appendChild(img);
    }
    const title = document.createElement('span');
    title.className = 'search-drawer__product-title';
    title.textContent = product.title;
    link.append(image, title);
    item.appendChild(link);
    return item;
  }

  setResultGroup(groupName, listName, items) {
    const group = this.querySelector(groupName);
    const list = this.querySelector(listName);
    list.replaceChildren(...items);
    group.hidden = items.length === 0;
  }

  renderResults(results, query) {
    const suggestions = (results.queries || [])
      .filter((item) => item.text)
      .slice(0, 4)
      .map((item) => this.textResult(item.text, this.searchHref(item.text)));
    const products = (results.products || [])
      .filter((item) => item.title && item.url)
      .slice(0, 4)
      .map((item) => this.productResult(item));
    const links = [...(results.collections || []), ...(results.pages || [])]
      .filter((item) => item.title && item.url)
      .slice(0, 4)
      .map((item) => this.textResult(item.title, item.url));

    this.setResultGroup('[data-search-suggestions]', '[data-search-suggestion-list]', suggestions);
    this.setResultGroup('[data-search-products]', '[data-search-product-list]', products);
    this.setResultGroup('[data-search-links]', '[data-search-link-list]', links);
    this.viewAll.href = this.searchHref(query);
    this.results.hidden = false;
    this.status.textContent = suggestions.length + products.length + links.length ? '' : this.dataset.emptyText;
  }
}

export default () => {
  customElements.get('search-drawer') || customElements.define('search-drawer', SearchDrawer);
};
