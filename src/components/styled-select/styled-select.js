import './styled-select.scss';

export class StyledSelect extends HTMLElement {
  constructor() {
    super();
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleOptionClick = this.handleOptionClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  connectedCallback() {
    try {
      this.input = this.querySelector('[data-input]');
      this.trigger = this.querySelector('[data-trigger]');
      this.label = this.querySelector('[data-select-label]');
      this.listbox = this.querySelector('[data-listbox]');
      this.options = Array.from(this.querySelectorAll('[data-option]'));

      // Add error checking for required elements
      if (!this.trigger) {
        console.error('Styled Select: No trigger button found with [data-trigger]');
        return;
      }

      if (!this.input) {
        console.error('Styled Select: No input found with [data-input]');
        return;
      }

      if (!this.listbox) {
        console.error('Styled Select: No listbox found with [data-listbox]');
        return;
      }

      this.setupInitialState();
      this.setupEventListeners();
    } catch (error) {
      console.error('Styled Select: Error during initialization', error);
    }
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  setupInitialState() {
    this.active = false;
    this.value = '';
    this.valueLabel = '';
    this.activeIndex = -1;

    // Set initial value for link selects
    if (this.hasAttribute('data-link-select')) {
      const currentPath = window.location.pathname;
      const currentOption = this.options.find(option =>
        option.getAttribute('data-value') === currentPath
      );

      if (currentOption) {
        this.value = currentOption.getAttribute('data-value');
        this.valueLabel = currentOption.textContent;
        this.setAttribute('data-has-value', '');
      }
    }
  }

  setupEventListeners() {
    try {
      if (this.trigger && !this.trigger._hasClickListener) {
        this.trigger.addEventListener('click', this.handleTriggerClick);
        this.trigger._hasClickListener = true;
      }

      if (this.listbox && !this.listbox._hasClickListener) {
        this.listbox.addEventListener('click', this.handleOptionClick);
        this.listbox._hasClickListener = true;
      }

      if (!this._hasKeydownListener) {
        this.addEventListener('keydown', this.handleKeydown);
        this._hasKeydownListener = true;
      }

      if (!this._hasOutsideClickListener) {
        document.addEventListener('click', this.handleOutsideClick);
        this._hasOutsideClickListener = true;
      }
    } catch (error) {
      console.error('Styled Select: Error setting up e listeners', error);
    }
  }

  removeEventListeners() {
    try {
      if (this.trigger && this.trigger._hasClickListener) {
        this.trigger.removeEventListener('click', this.handleTriggerClick);
        this.trigger._hasClickListener = false;
      }

      if (this.listbox && this.listbox._hasClickListener) {
        this.listbox.removeEventListener('click', this.handleOptionClick);
        this.listbox._hasClickListener = false;
      }

      if (this._hasKeydownListener) {
        this.removeEventListener('keydown', this.handleKeydown);
        this._hasKeydownListener = false;
      }

      if (this._hasOutsideClickListener) {
        document.removeEventListener('click', this.handleOutsideClick);
        this._hasOutsideClickListener = false;
      }
    } catch (error) {
      console.error('Styled Select: Error removing e listeners', error);
    }
  }

  handleTriggerClick() {
    if (this.trigger.hasAttribute('disabled')) return;
    this.active ? this.close() : this.open();
  }

  handleOptionClick(e) {
    const option = e.target.closest('[data-option]');
    if (!option) return;

    this.setValue(option.getAttribute('data-value'), option.textContent.trim());
    this.close();
  }

  handleOutsideClick(e) {
    if (!this.contains(e.target)) {
      this.close();
    }
  }

  handleKeydown(e) {
    if (!this.active && e.key !== 'Enter' && e.key !== ' ') return;

    const keys = {
      Enter: () => (this.active ? this.options[this.activeIndex]?.click() : this.open()),
      ' ': () => (this.active ? this.options[this.activeIndex]?.click() : this.open()),
      ArrowDown: () => this.moveSelection(1),
      ArrowUp: () => this.moveSelection(-1),
      Escape: () => this.close(),
    };

    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  }

  moveSelection(direction) {
    if (!this.active) return;

    this.options[this.activeIndex]?.removeAttribute('data-active');

    this.activeIndex = Math.max(0, Math.min(this.options.length - 1, this.activeIndex + direction));

    const activeOption = this.options[this.activeIndex];
    activeOption?.setAttribute('data-active', '');
    activeOption?.focus();
  }

  setValue(value, label) {
    this.value = value;
    this.valueLabel = label;

    if (value && label) {
      this.setAttribute('data-has-value', '');
      this.querySelector('[data-label]').textContent = label;
      this.input.setCustomValidity('');

      // Handle navigation if this is a link select
      if (this.hasAttribute('data-link-select')) {
        window.location.href = value;
        return;
      }
    } else {
      this.removeAttribute('data-has-value');
      this.querySelector('[data-label]').textContent = '';
      if (this.input.hasAttribute('required')) {
        this.input.setCustomValidity('Please select an option');
      }
    }

    this.input.value = value;
    this.updateOptions();
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  updateOptions() {
    this.options.forEach((option) => {
      const isSelected = option.getAttribute('data-value') === this.value;
      option.setAttribute('data-selected', isSelected);
      option.setAttribute('aria-selected', isSelected);
    });
  }

  open() {
    this.active = true;
    this.setAttribute('data-active', 'true');
    this.trigger.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.active = false;
    this.setAttribute('data-active', 'false');
    this.trigger.setAttribute('aria-expanded', 'false');
  }

  // Add method to check validity on form submit
  checkValidity() {
    if (this.input.hasAttribute('required') && !this.value) {
      this.input.setCustomValidity('Please select an option');
      return false;
    }
    this.input.setCustomValidity('');
    return true;
  }
}

export default () => {
  customElements.get('styled-select') ||
    customElements.define('styled-select', StyledSelect);
};
