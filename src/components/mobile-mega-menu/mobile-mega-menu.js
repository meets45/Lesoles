import './mobile-mega-menu.scss';

import { createFocusTrap } from 'focus-trap';
import { disableBodyScroll, enableBodyScroll } from '@/helpers/body-scroll';

class MobileMegaMenu extends HTMLElement {
  constructor() {
    super();
    this.active = false;
    this.hideTimer = undefined;

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    this.openTriggers = [...document.querySelectorAll('[data-mobile-mega-menu-trigger]')];
    this.closeTrigger = this.querySelector('[data-close]');
    this.content = this.querySelector('[data-mobile-mega-menu-content]');
    this.panels = [...this.querySelectorAll('mobile-mega-menu-panel')];
    this.trap = createFocusTrap([this.content, this.closeTrigger.parentElement], { escapeDeactivates: false });
    this.openTriggers.forEach((trigger) => trigger.addEventListener('click', this.open));
    this.closeTrigger?.addEventListener('click', this.close);
    this.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback() {
    this.openTriggers.forEach((trigger) => trigger.removeEventListener('click', this.open));
    this.closeTrigger?.removeEventListener('click', this.close);
    this.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.handleResize);
    clearTimeout(this.hideTimer);
    this.trap?.deactivate({ returnFocus: false });
  }

  open() {
    if (this.active) return;
    clearTimeout(this.hideTimer);
    this.active = true;
    this.style.display = 'block';
    this.openTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'true'));
    this.setAttribute('aria-hidden', 'false');
    disableBodyScroll();
    requestAnimationFrame(() => {
      if (!this.active) return;
      this.dataset.active = 'true';
      this.trap.activate();
    });
  }

  close() {
    if (!this.active) return;
    [...this.panels].reverse().forEach((panel) => panel.close?.({ returnFocus: false }));
    this.trap.deactivate();
    this.active = false;
    this.dataset.active = 'false';
    this.setAttribute('aria-hidden', 'true');
    this.openTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
    enableBodyScroll();
    this.hideTimer = setTimeout(() => {
      if (!this.active) this.style.display = 'none';
    }, 240);
  }

  handleResize() {
    if (window.innerWidth > 768) this.close();
  }

  handleKeyDown(event) {
    if (event.key !== 'Escape') return;
    const activePanels = this.panels.filter((panel) => panel.active);
    if (activePanels.length) activePanels[activePanels.length - 1].close();
    else this.close();
    event.preventDefault();
  }
}

export default () => {
  customElements.get('mobile-mega-menu') || customElements.define('mobile-mega-menu', MobileMegaMenu);
};
