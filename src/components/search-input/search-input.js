import './search-input.scss';

class SearchInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.clear = this.querySelector('[data-search-input-clear]');
    this.handleClearClick = this.handleClearClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  connectedCallback() {
    this.clear?.addEventListener('click', this.handleClearClick);
    this.input?.addEventListener('input', this.handleInput);
    this.handleInput();
  }

  disconnectedCallback() {
    this.clear?.removeEventListener('click', this.handleClearClick);
    this.input?.removeEventListener('input', this.handleInput);
  }

  handleInput() {
    if (this.clear) this.clear.hidden = !this.input?.value;
  }

  handleClearClick() {
    this.input.value = '';
    this.input.focus();
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export default () => {
  customElements.get('search-input') || customElements.define('search-input', SearchInput);
};
