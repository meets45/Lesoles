import './suggestion-chip.scss';

class SuggestionChip extends HTMLElement {
  constructor() {
    super();
    this.ariaLabelTemplate = this.getAttribute('data-aria-label-template');
    this.button = this.querySelector('button');
  }

  setTerm(term) {
    this.button.innerText = term;
    this.button.setAttribute('aria-label', `${this.ariaLabelTemplate} ${term}`);
    this.button.setAttribute('data-term', term);
  }
}

export default () => {
  customElements.get('suggestion-chip') ||
    customElements.define('suggestion-chip', SuggestionChip);
};
