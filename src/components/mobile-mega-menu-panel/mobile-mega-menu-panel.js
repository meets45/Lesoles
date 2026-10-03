import './mobile-mega-menu-panel.scss';

import { createFocusTrap } from 'focus-trap';

class MobileMegaMenuPanel extends HTMLElement {
  constructor() {
    super();
    this.handle = this.getAttribute('data-mobile-mega-menu-panel');
    this.menu = this.closest('mobile-mega-menu');
    this.openTrigger = this.menu?.querySelector(
      `[data-mobile-mega-menu-panel-trigger="${this.handle}"]`,
    );
    this.closeTrigger = this.querySelector(`[data-mobile-mega-menu-panel-close]`);
    this.active = this.getAttribute('data-active') === 'true';

    // this is a little tricky, but we include both this element, and the main close button's parent div in this trap
    this.trap = createFocusTrap([this, this.menu.closeTrigger.parentElement]);
  }

  connectedCallback() {
    this.openTrigger?.addEventListener('click', this.open.bind(this));
    this.closeTrigger?.addEventListener('click', this.close.bind(this));
  }

  disconnectedCallback() {
    this.openTrigger?.removeEventListener('click', this.open.bind(this));
    this.closeTrigger?.removeEventListener('click', this.close.bind(this));
  }

  open() {
    this.active = true;
    this.style.display = 'block';
    setTimeout(() => {
      this.openTrigger.setAttribute('aria-expanded', true);
      this.setAttribute('aria-hidden', false);
      this.setAttribute('data-active', true);
      this.trap.activate();
    }, 100);
  }

  close() {
    this.active = false;
    this.trap.deactivate();
    this.openTrigger.setAttribute('aria-expanded', false);
    this.setAttribute('data-active', false);
    this.setAttribute('aria-hidden', true);
    setTimeout(() => {
      this.style.display = 'none';
    }, 100);
  }
}

export default () => {
  customElements.get('mobile-mega-menu-panel') ||
    customElements.define('mobile-mega-menu-panel', MobileMegaMenuPanel);
};
