import './search-input.scss';

class SearchInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.clear = this.querySelector('[data-search-input-clear]');
  }

  connectedCallback() {
    this.clear.addEventListener('click', this.handleClearClick.bind(this));
  }

  disconnectedCallback() {
    this.clear.removeEventListener('click', this.handleClearClick.bind(this));
  }

  handleClearClick() {
    this.input.value = '';
    this.input.focus();
    this.input.dispatchEvent(new Event('input'));
  }
}

export default () => {
  customElements.get('search-input') ||
    customElements.define('search-input', SearchInput);
};
