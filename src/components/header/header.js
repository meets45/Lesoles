import './header.scss';
import { MegaMenu } from '@/components/mega-menu/mega-menu.js';

class Header extends HTMLElement {
  static disableIdle = false;
  constructor() {
    super();
    this.scrollY = window.scrollY;
    this.idleTimer = undefined;
    this.scrollTimer = undefined;
    this.enableSticky = this.getAttribute('data-enable-sticky') === 'true';
    this.searchDrawer = this.querySelector('[data-search-drawer]');
  }

  connectedCallback() {
    document.addEventListener('scroll', this.handleScroll.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  /** Displays the header after 5s delay of no scroll interaction */
  handleIdle() {
    console.log('hadnling idle');
    console.log(this.disableIdle);
    if (!this.disableIdle) {
      this.setAttribute('data-scrolled', false);
      document.documentElement.removeAttribute('data-header-hidden');
    }
  }

  /** Moves the header off screen when scrolling down */
  handleScroll() {
    // close any open elements
    MegaMenu.closeMenus();
    if (window.innerWidth >= 769) this.searchDrawer.close();

    clearTimeout(this.idleTimer);
    if (window.scrollY === 0) {
      this.setAttribute('data-is-top', true);
    } else {
      this.setAttribute('data-is-top', false);
    }

    // ignore interactions if there hasn't been a significant difference
    if (Math.abs(this.scrollY - window.scrollY) < 100) {
      if (!Header.disableIdle) {
        return (this.idleTimer = setTimeout(this.handleIdle.bind(this), 5000));
      }
      return;
    }

    if (this.enableSticky) {
      // scrolling down
      if (this.scrollY <= window.scrollY) {
        this.setAttribute('data-scrolled', true);
        document.documentElement.setAttribute('data-header-hidden', '');
      }
      // scrolling up
      if (this.scrollY >= window.scrollY) {
        this.setAttribute('data-scrolled', false);
        document.documentElement.removeAttribute('data-header-hidden');
      }
    }

    this.scrollY = window.scrollY;
    if (!Header.disableIdle) {
      this.idleTimer = setTimeout(this.handleIdle.bind(this), 5000);
    }
  }
}

export { Header };

export default () => {
  customElements.get('site-header') || customElements.define('site-header', Header);
}
