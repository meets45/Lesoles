import './header.scss';
import { MegaMenu } from '@/components/mega-menu/mega-menu.js';

class Header extends HTMLElement {
  constructor() {
    super();
    this.handleScroll = this.handleScroll.bind(this);
  }

  connectedCallback() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    MegaMenu.closeMenus();
  }
}

export default () => {
  customElements.get('site-header') || customElements.define('site-header', Header);
};
