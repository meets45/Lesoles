import './mobile-mega-menu.scss';

import { createFocusTrap } from 'focus-trap';
import { disableBodyScroll, enableBodyScroll } from '@/helpers/body-scroll';

class MobileMegaMenu extends HTMLElement {
  constructor() {
    super();
    this.active = this.getAttribute('data-active') === 'true';
    this.openTrigger = document.querySelector(`[data-mobile-mega-menu-trigger]`);
    this.closeTrigger = this.querySelector('[data-close]');
    this.content = this.querySelector('[data-mobile-mega-menu-content]');
    this.panels = this.querySelectorAll('mobile-mega-menu-panel');
    // focus on all content within this element, except
    this.trap = createFocusTrap([this.content, this.closeTrigger.parentElement]);
  }

  connectedCallback() {
    this.openTrigger.addEventListener('click', this.open.bind(this));
    this.closeTrigger.addEventListener('click', this.close.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  disconnectedCallback() {
    this.openTrigger.removeEventListener('click', this.open.bind(this));
    this.closeTrigger.removeEventListener('click', this.close.bind(this));
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  open() {
    this.active = true;
    this.style.display = 'block';
    setTimeout(() => {
      this.setAttribute('data-active', true);
      this.setAttribute('aria-hidden', false);
      this.openTrigger.setAttribute('aria-expanded', true);
      disableBodyScroll();
      // disableBodyScroll(document.body);
      // disableBodyScroll(this);
      setTimeout(this.trap.activate, 100);
    }, 10);
  }

  close() {
    this.active = false;
    this.trap.deactivate();
    this.setAttribute('data-active', false);
    this.setAttribute('aria-hidden', true);
    this.openTrigger.setAttribute('aria-expanded', false);
    this.panels.forEach((p) => p.close());
    enableBodyScroll();
    setTimeout(() => (this.style.display = 'none'), 200);
  }

  handleResize() {
    if (window.innerWidth > 768) {
      this.close();
    }
  }
}

export default () => {
  customElements.get('mobile-mega-menu') ||
    customElements.define('mobile-mega-menu', MobileMegaMenu);
}
