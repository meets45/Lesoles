import './reviews-drawer.scss';

class ReviewsDrawer extends HTMLElement {
  constructor() {
    super();
    this.elements = {
      drawer: this.querySelector('component-drawer'),
      tabs: this.querySelectorAll('[data-tab]'),
      tabContents: this.querySelectorAll('[data-tab-content]'),
    };
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Set up tab switching
    this.elements.tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });
  }

  switchTab(tabId) {
    // Update active tab
    this.elements.tabs.forEach((tab) => {
      if (tab.dataset.tab === tabId) {
        tab.setAttribute('aria-selected', 'true');
        tab.classList.add('reviews-drawer__tab--active');
      } else {
        tab.setAttribute('aria-selected', 'false');
        tab.classList.remove('reviews-drawer__tab--active');
      }
    });

    // Update visible content
    this.elements.tabContents.forEach((content) => {
      if (content.dataset.tabContent === tabId) {
        content.classList.add('reviews-drawer__tab-content--active');
        content.removeAttribute('hidden');
      } else {
        content.classList.remove('reviews-drawer__tab-content--active');
        content.setAttribute('hidden', '');
      }
    });
  }
}

export default () => {
  customElements.get('reviews-drawer') ||
    customElements.define('reviews-drawer', ReviewsDrawer);
};
