import './mega-menu-dropdown.scss';

class MegaMenuDropdown extends HTMLElement {
  constructor() {
    super();
    this.active = false;
    this.disableHoverInteraction = false;
    this.trigger = this.querySelector('[data-mega-menu-dropdown-trigger]');
    this.hoverTrigger = this.querySelector(`[data-mega-menu-dropdown-hover]`);
    this.closeTimer = undefined;
  }

  connectedCallback() {
    this.trigger.addEventListener('click', this.handleClick.bind(this));
    this.addEventListener('mouseover', this.handleHover.bind(this));
    this.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    document.addEventListener('focusin', this.handleFocus.bind(this));
  }

  disconnectedCallback() {
    this.trigger.removeEventListener('click', this.handleClick.bind(this));
    this.removeEventListener('mouseover', this.handleHover.bind(this));
    this.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    document.removeEventListener('focusin', this.handleFocus.bind(this));
  }

  open() {
    this.active = true;
    this.setAttribute('data-active', true);
    this.trigger.setAttribute('aria-expanded', true);
  }

  close() {
    this.active = false;
    this.setAttribute('data-active', false);
    this.trigger.setAttribute('aria-expanded', false);
  }

  handleClick() {
    this.disableHoverInteraction = true;
    if (!this.active) {
      this.open();
    } else {
      this.close();
    }
  }

  handleHover(e) {
    if (!this.disableHoverInteraction && this.contains(e.target)) {
      clearTimeout(this.closeTimer);
      if (!this.active) this.open();
    }
  }

  handleMouseLeave() {
    if (!this.disableHoverInteraction) {
      clearTimeout(this.closeTimer);
      this.closeTimer = setTimeout(this.close.bind(this), 500);
    }
  }

  handleFocus(e) {
    if (this.active && !this.contains(e.target)) {
      this.close();
    }
  }
}

export default () => {
  customElements.get('mega-menu-dropdown') ||
    customElements.define('mega-menu-dropdown', MegaMenuDropdown);
};
