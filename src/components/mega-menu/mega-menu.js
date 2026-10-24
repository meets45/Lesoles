import './mega-menu.scss';

class MegaMenu extends HTMLElement {
  static menus = new Set();

  static closeMenus() {
    MegaMenu.menus.forEach((menu) => menu.close());
  }

  constructor() {
    super();
    this.active = false;
    this.closeTimer = undefined;

    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleNavPointerEnter = this.handleNavPointerEnter.bind(this);
    this.handleNavPointerLeave = this.handleNavPointerLeave.bind(this);
    this.handleNavFocusIn = this.handleNavFocusIn.bind(this);
    this.handlePanelPointerOver = this.handlePanelPointerOver.bind(this);
    this.handlePanelFocusIn = this.handlePanelFocusIn.bind(this);
    this.handlePanelClick = this.handlePanelClick.bind(this);
    this.handleDocumentFocusIn = this.handleDocumentFocusIn.bind(this);
    this.handleDocumentPointerDown = this.handleDocumentPointerDown.bind(this);
    this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
  }

  connectedCallback() {
    this.navItem = this.closest('[data-mega-menu-hover]');
    this.trigger = this.navItem?.querySelector('[data-mega-menu-trigger]');
    this.backButton = this.querySelector('[data-mega-menu-back]');
    this.currentTitle = this.querySelector('[data-mega-menu-current-title]');
    this.categoryButtons = [...this.querySelectorAll('[data-mega-menu-panel-trigger]')];
    this.panels = [...this.querySelectorAll('[data-mega-menu-panel]')];
    MegaMenu.menus.add(this);
    this.trigger?.addEventListener('click', this.handleTriggerClick);
    this.navItem?.addEventListener('pointerenter', this.handleNavPointerEnter);
    this.navItem?.addEventListener('pointerleave', this.handleNavPointerLeave);
    this.navItem?.addEventListener('focusin', this.handleNavFocusIn);
    this.addEventListener('pointerover', this.handlePanelPointerOver);
    this.addEventListener('focusin', this.handlePanelFocusIn);
    this.addEventListener('click', this.handlePanelClick);
    document.addEventListener('focusin', this.handleDocumentFocusIn);
    document.addEventListener('pointerdown', this.handleDocumentPointerDown);
    document.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  disconnectedCallback() {
    MegaMenu.menus.delete(this);
    clearTimeout(this.closeTimer);
    this.trigger?.removeEventListener('click', this.handleTriggerClick);
    this.navItem?.removeEventListener('pointerenter', this.handleNavPointerEnter);
    this.navItem?.removeEventListener('pointerleave', this.handleNavPointerLeave);
    this.navItem?.removeEventListener('focusin', this.handleNavFocusIn);
    this.removeEventListener('pointerover', this.handlePanelPointerOver);
    this.removeEventListener('focusin', this.handlePanelFocusIn);
    this.removeEventListener('click', this.handlePanelClick);
    document.removeEventListener('focusin', this.handleDocumentFocusIn);
    document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  open() {
    MegaMenu.menus.forEach((menu) => {
      if (menu !== this) menu.close();
    });
    clearTimeout(this.closeTimer);
    this.active = true;
    this.dataset.active = 'true';
    if (this.navItem) this.navItem.dataset.menuOpen = 'true';
    this.trigger?.setAttribute('aria-expanded', 'true');
  }

  close() {
    if (!this.active) return;
    clearTimeout(this.closeTimer);
    this.active = false;
    this.dataset.active = 'false';
    if (this.navItem) this.navItem.dataset.menuOpen = 'false';
    this.trigger?.setAttribute('aria-expanded', 'false');
    this.selectPanel('overview');
  }

  selectPanel(id) {
    const selectedPanel = this.panels.find((panel) => panel.dataset.megaMenuPanel === id);
    if (!selectedPanel) return;

    this.panels.forEach((panel) => {
      panel.dataset.active = panel.dataset.megaMenuPanel === id ? 'true' : 'false';
    });
    this.categoryButtons.forEach((button) => {
      button.setAttribute('aria-expanded', button.dataset.megaMenuPanelTrigger === id ? 'true' : 'false');
    });
    if (this.backButton) this.backButton.hidden = id === 'overview';
    if (this.currentTitle) this.currentTitle.textContent = selectedPanel.dataset.megaMenuPanelTitle;
  }

  handleTriggerClick() {
    if (this.active) this.close();
    else this.open();
  }

  handleNavPointerEnter(event) {
    if (event.pointerType === 'mouse') this.open();
    clearTimeout(this.closeTimer);
  }

  handleNavPointerLeave() {
    this.closeTimer = setTimeout(() => this.close(), 180);
  }

  handleNavFocusIn() {
    this.open();
  }

  handlePanelPointerOver(event) {
    const button = event.target.closest('[data-mega-menu-panel-trigger]');
    if (button) this.selectPanel(button.dataset.megaMenuPanelTrigger);
  }

  handlePanelFocusIn(event) {
    const button = event.target.closest('[data-mega-menu-panel-trigger]');
    if (button) this.selectPanel(button.dataset.megaMenuPanelTrigger);
  }

  handlePanelClick(event) {
    if (event.target.closest('[data-mega-menu-back]')) {
      this.selectPanel('overview');
      this.currentTitle?.focus({ preventScroll: true });
      return;
    }

    const button = event.target.closest('[data-mega-menu-panel-trigger]');
    if (button) this.selectPanel(button.dataset.megaMenuPanelTrigger);
  }

  handleDocumentFocusIn(event) {
    if (this.active && !this.navItem?.contains(event.target)) this.close();
  }

  handleDocumentPointerDown(event) {
    if (this.active && !this.navItem?.contains(event.target)) this.close();
  }

  handleDocumentKeyDown(event) {
    if (this.active && event.key === 'Escape') {
      this.close();
      this.trigger?.focus();
    }
  }
}

export { MegaMenu };

export default () => {
  customElements.get('mega-menu') || customElements.define('mega-menu', MegaMenu);
};
