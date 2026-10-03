import './accordion.scss';

class Accordion extends HTMLElement {
  constructor() {
    super();
    this.toggle = this.querySelector('[data-accordion-toggle]');
    this.content = this.querySelector('[data-accordion-content]');

    if (!this.toggle || !this.content) return;

    this.toggle.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(e) {
    // Don't handle clicks on form elements or their labels
    if (e.target.closest('input') || e.target.closest('label')) {
      return;
    }

    const isExpanded = this.toggle.getAttribute('aria-expanded') === 'true';
    this.toggle.setAttribute('aria-expanded', !isExpanded);
    this.setAttribute('data-active', !isExpanded);
  }
}

export default () => {
  customElements.get('accordion-panel') ||
    customElements.define('accordion-panel', Accordion);
}
