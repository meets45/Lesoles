import './signup-modal.scss';

import { Modal } from '@/components/modal/modal';

/**
 * Signup Modal Web Component
 *
 * The modal has <customizable from settings> seconds delay upon arriving to the page.
 * If user scrolls down 25px prior to set delay, the modal triggers.
 * The modal will set cookie "signup_modal_shown" that expires in 24hours, so the modal can be shown once per day
 * The modal shows up only to new/guest users who are not opted into emails.
 */
class SignupModal extends HTMLElement {
  constructor() {
    super();
    this.elements = {
      modal: this.querySelector('site-modal'),
      trigger: null,
    };
    if (!customElements.get('site-modal')) customElements.define('site-modal', Modal);
    this.scrollPosition = window.scrollY;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      // Get delay status from data attribute defaults to 5s
      this.delay = parseInt(this.dataset.modalDelay*1000 || '5000', 10);
      // Get email optin from the window object
      this.newsletter = window.customer.newsletter;

      // if user is newsletter or modal was shown in the last 24hours, do nothing!
      if (this.newsletter || this.getCookie('signup_modal_shown')) {
        return;
      }

      this.setupObserver();

      this.setupEventListeners();
      this.setModalTimeout();
    }
  }

  // Sets up an element 25px below the page, so we can trigger when user scrolls down 25px and trigger the modal.
  setupObserver() {
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.showModal();
          observer.disconnect(); // Disconnect the observer
          clearTimeout(this.timeoutId); // Clear the timeout if IntersectionObserver fires
        }
      });
    }, { threshold: 0.1 });

    var target = document.createElement('div');
    target.style.position = 'absolute';
    target.style.bottom = `-${this.scrollPosition + 25}px`;
    target.style.width = '1px';
    target.style.height = '1px';
    target.setAttribute('aria-hidden', true);
    document.body.appendChild(target);

    this.observer.observe(target);
  }

  setupEventListeners() {
    const closeButtons = this.querySelectorAll('[data-modal-close]');
    closeButtons.forEach((button) => {
      button.addEventListener('click', () => this.closeModal());
    });

    const form = this.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.closeModal();
        // Add form submission logic here
      });
    }
  }

  // Sets modal timeout from the delay settings of signup modal section
  setModalTimeout() {
    this.timeoutId = setTimeout(() => {
      this.showModal();
    }, this.delay);
  }

  showModal() {
    this.scrollPosition = window.scrollY;
    this.elements.modal?.setAttribute('data-force-open', '');
    this.elements.modal?.open();
    window.removeEventListener('scroll', this.checkScrollPosition.bind(this)); // Remove scroll event listener
    clearTimeout(this.timeoutId);
    this.setCookie('signup_modal_shown', 'true', 1);
  }

  checkScrollPosition() {
    if (window.scrollY >= 25) {
      this.showModal();
      window.removeEventListener('scroll', this.checkScrollPosition.bind(this));
      clearTimeout(this.timeoutId); // Clear the timeout if scroll position triggers
    }
  }

  closeModal() {
    window.scrollTo(0, this.scrollPosition);
    window.removeEventListener('scroll', this.checkScrollPosition.bind(this));
    if (this.observer) {
      this.observer.disconnect(); // Disconnect the observer when modal closes
    }
    clearTimeout(this.timeoutId);
    this.elements.modal?.removeAttribute('data-force-open');
    this.elements.modal?.close();
  }

  // Sets a cookie "signup_modal_shown" that expires in 24 hours.
  setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}

export default () => {
  customElements.get('signup-modal') ||
    customElements.define('signup-modal', SignupModal);
};
