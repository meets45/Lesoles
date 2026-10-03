import './mega-menu.scss';

class MegaMenu extends HTMLElement {
  /** Keep track of all menus to easily close them later */
  static menus = [];

  static closeMenus() {
    MegaMenu.menus.forEach((m) => m.close());
  }

  constructor() {
    super();
    this.active = false;
    this.trigger = document.querySelector(`[data-mega-menu-trigger="${this.id}"]`);
    this.hoverTrigger = document.querySelector(`[data-mega-menu-hover="${this.id}"]`);
    this.closeTimer = undefined;

    MegaMenu.menus.push(this);
  }

  connectedCallback() {
    this.trigger?.addEventListener('click', this.handleTriggerClick.bind(this));
    document.addEventListener('mouseover', this.handleHover.bind(this));
    this.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.hoverTrigger.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    document.addEventListener('focusin', this.handleFocus.bind(this));
  }

  disconnectedCallback() {
    this.trigger?.removeEventListener('click', this.handleTriggerClick.bind(this));
    document.removeEventListener('mouseover', this.handleHover.bind(this));
    this.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.hoverTrigger.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    document.removeEventListener('focusin', this.handleFocus.bind(this));
  }

  open() {
    this.closeOtherMenus();
    this.active = true;
    this.setAttribute('data-active', true);
    this.trigger.setAttribute('aria-expanded', true);
  }

  close() {
    this.active = false;
    this.setAttribute('data-active', false);
    this.trigger.setAttribute('aria-expanded', false);
  }

  closeOtherMenus() {
    MegaMenu.menus.forEach((m) => {
      if (m.id !== this.id) m.close();
    });
  }

  handleTriggerClick() {
    if (!this.active) {
      this.open();
    } else {
      this.close();
    }
  }

  handleHover(e) {
    // if the hover event is within the hover trigger, or inside of the menu
    if (e.target.closest(`[data-mega-menu-hover="${this.id}"]`) || this.contains(e.target)) {
      clearTimeout(this.closeTimer);
      if (!this.active) this.open();
    }
  }

  handleMouseLeave() {
    this.closeTimer = setTimeout(this.close.bind(this), 500);
  }

  handleFocus(e) {
    if (this.active && !this.contains(e.target)) {
      this.close();
    }
  }
}

export { MegaMenu };

export default () => {
  customElements.get('mega-menu') || customElements.define('mega-menu', MegaMenu);
};
