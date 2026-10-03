import './modal.scss';

import { createFocusTrap } from 'focus-trap';

class Modal extends HTMLElement {
  constructor() {
    super();
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.modal = this.querySelector('[data-modal]');
    this.container = this.querySelector('[data-modal-container]');
    this.triggers = document.querySelectorAll(`[data-modal-trigger="${this.id}"]`);
    this.closeButtons = this.querySelectorAll('[data-modal-close]');

    this.setupEventListeners();
  }

  connectedCallback() {
    this.trap = undefined;

    if (!this.modal) {
      console.error('Modal: No modal element found with [data-modal]');
      return;
    }

    document.addEventListener('click', this.handleTriggerClick);
    this.addEventListener('click', this.handleCloseClick);

    // Add keyboard handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.hasAttribute('data-force-open')) {
        this.close();
      }
    });
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleTriggerClick);
    this.removeEventListener('click', this.handleCloseClick);
  }

  setupEventListeners() {
    this.triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        this.open(trigger);
      });
    });

    this.closeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        // Remove focus from the close button before closing
        button.blur();
        // Small delay to ensure blur happens before closing
        setTimeout(() => this.close(), 10);
      });
    });
  }

  handleTriggerClick(e) {
    const trigger = e.target.closest(`[data-modal-trigger="${this.id}"]`);
    if (trigger) {
      this.open(trigger);
    }
  }

  handleCloseClick(e) {
    const closeButton = e.target.closest('[data-modal-close]');
    if (!closeButton) return;

    // Don't close if modal is forced open
    if (this.hasAttribute('data-force-open')) return;

    // Always close if clicking a close button
    if (closeButton.tagName === 'BUTTON') {
      this.close();
      return;
    }

    // For overlay clicks, don't close if clicking inside the container
    if (this.container && this.container.contains(e.target)) {
      return;
    }

    this.close();
  }

  open(trigger) {
    if (!this.modal) return;

    this.trap = createFocusTrap([trigger, this.modal]);
    this.removeAttribute('hidden');
    this.setAttribute('data-active', 'true');
    this.modal.setAttribute('aria-hidden', 'false');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    setTimeout(() => this.trap?.activate(), 100);
  }

  close() {
    if (!this.modal) return;

    this.trap?.deactivate();
    this.setAttribute('data-active', 'false');
    this.modal.removeAttribute('aria-hidden');

    // Restore body scroll
    document.body.style.overflow = '';

    // Hide after animation
    setTimeout(() => {
      this.setAttribute('hidden', '');
    }, 300);

    // Return focus to trigger if it exists
    const trigger = document.querySelector(`[data-modal-trigger="${this.id}"]`);
    if (trigger) {
      trigger.focus();
    }
  }
}

export { Modal };

export default () => {
  customElements.get('site-modal') || customElements.define('site-modal', Modal);
};
