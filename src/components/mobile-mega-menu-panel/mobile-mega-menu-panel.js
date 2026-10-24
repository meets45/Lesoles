import './mobile-mega-menu-panel.scss';

import { createFocusTrap } from 'focus-trap';

class MobileMegaMenuPanel extends HTMLElement {
  constructor() {
    super();
    this.active = false;
    this.hideTimer = undefined;

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  connectedCallback() {
    this.handle = this.dataset.mobileMegaMenuPanel;
    this.menu = this.closest('mobile-mega-menu');
    this.openTrigger = this.menu?.querySelector(`[data-mobile-mega-menu-panel-trigger="${this.handle}"]`);
    this.closeTrigger = this.querySelector('[data-mobile-mega-menu-panel-close]');
    this.trap = createFocusTrap([this, this.menu.closeTrigger.parentElement], {
      escapeDeactivates: false,
    });
    this.openTrigger?.addEventListener('click', this.open);
    this.closeTrigger?.addEventListener('click', this.close);
  }

  disconnectedCallback() {
    this.openTrigger?.removeEventListener('click', this.open);
    this.closeTrigger?.removeEventListener('click', this.close);
    clearTimeout(this.hideTimer);
    this.trap?.deactivate({ returnFocus: false });
  }

  open() {
    if (this.active) return;
    clearTimeout(this.hideTimer);
    this.active = true;
    this.style.display = 'block';
    this.openTrigger?.setAttribute('aria-expanded', 'true');
    this.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      if (!this.active) return;
      this.dataset.active = 'true';
      this.trap.activate();
    });
  }

  close({ returnFocus = true } = {}) {
    if (!this.active) return;
    this.active = false;
    this.trap.deactivate({ returnFocus });
    this.openTrigger?.setAttribute('aria-expanded', 'false');
    this.dataset.active = 'false';
    this.setAttribute('aria-hidden', 'true');
    this.hideTimer = setTimeout(() => {
      if (!this.active) this.style.display = 'none';
    }, 240);
  }
}

export default () => {
  customElements.get('mobile-mega-menu-panel') || customElements.define('mobile-mega-menu-panel', MobileMegaMenuPanel);
};
