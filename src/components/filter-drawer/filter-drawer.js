import { createFocusTrap } from 'focus-trap';
import EVENTS from '@/helpers/events';
import { disableBodyScroll, enableBodyScroll } from '@/helpers/body-scroll';
import SectionsAPIService from '@/helpers/sections-api-service';
import parseHTML from '@/helpers/parse-html';

class FilterDrawer extends HTMLElement {
  constructor() {
    super();
    this.active = this.getAttribute('data-active') === 'true';
    this.openTriggers = document.querySelectorAll(`[data-filter-drawer-trigger]`);
    this.closeTriggers = this.querySelectorAll('[data-close]');
    this.content = this.querySelector('[data-content]');
    this.applyButton = this.querySelector('[data-filter-apply]');
    this.resetButton = this.querySelector('[data-filter-reset]');
    this.inputs = this.querySelectorAll('input');
    this.trap = createFocusTrap(this, { allowOutsideClick: true });
  }

  connectedCallback() {
    this.openTriggers.forEach((el) => el.addEventListener('click', this.open.bind(this)));
    this.closeTriggers.forEach((el) => el.addEventListener('click', this.close.bind(this)));
    document.addEventListener(EVENTS.FILTER_UPDATE, this.render.bind(this));
    this.applyButton.addEventListener('click', this.apply.bind(this));
    this.resetButton.addEventListener('click', this.reset.bind(this));
  }

  disconnectedCallback() {
    this.openTriggers.forEach((el) => el.removeEventListener('click', this.open.bind(this)));
    this.closeTriggers.forEach((el) => el.removeEventListener('click', this.close.bind(this)));
    document.removeEventListener(EVENTS.FILTER_UPDATE, this.render.bind(this));
    this.applyButton.removeEventListener('click', this.apply.bind(this));
    this.resetButton.removeEventListener('click', this.reset.bind(this));
  }

  open() {
    this.active = true;
    this.style.display = 'block';
    setTimeout(() => {
      this.setAttribute('data-active', true);
      this.setAttribute('aria-hidden', false);
      this.setAttribute('aria-modal', true);
      this.openTriggers.forEach((el) => el.setAttribute('aria-expanded', true));
      disableBodyScroll();
      setTimeout(this.trap.activate, 100);
    }, 10);
  }

  close() {
    this.active = false;
    this.trap.deactivate();
    this.setAttribute('data-active', false);
    this.setAttribute('aria-hidden', true);
    this.setAttribute('aria-modal', false);
    this.openTriggers.forEach((el) => el.setAttribute('aria-expanded', false));
    enableBodyScroll();
    setTimeout(() => (this.style.display = 'none'), 200);
  }

  apply() {
    const url = new URL(`${window.location.origin}${window.location.pathname}`);
    this.inputs.forEach((input) => {
      const name = input.name;
      const value = input.value;

      if (input.type === 'checkbox' && input.checked) {
        url.searchParams.append(name, value);
      }

      if (input.type === 'number') {
        url.searchParams.set(name, value);
      }
    });

    window.history.replaceState(null, '', url);
    this.close();
    document.dispatchEvent(new CustomEvent(EVENTS.FILTER_UPDATE));
  }

  reset() {
    const url = new URL(`${window.location.origin}${window.location.pathname}`);
    window.history.replaceState(null, '', url);
    document.dispatchEvent(new CustomEvent(EVENTS.FILTER_UPDATE));
  }

  async render() {
    // get the current URL
    const url = new URL(window.location.href);
    // get the markup for the inputs from the sections API
    const text = await SectionsAPIService.fetch(url, 'main-product-grid');
    const nextInputs = parseHTML(text, 'filter-drawer input', true);
    // for each input, go looking for the input with the same ID in the markup
    this.inputs.forEach((input) => {
      // set the state of the input based on its state in the fetched markup
      const nextInput = Array.from(nextInputs).find((ni) => ni.id === input.id);
      if (nextInput) {
        input.checked = nextInput.checked;
        input.disabled = nextInput.disabled;
      }
    });
  }
}

export default () => {
  customElements.get('filter-drawer') || customElements.define('filter-drawer', FilterDrawer);
}
