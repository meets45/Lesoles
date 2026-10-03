/** Publishes messages to screenreader users */
class AriaAnnouncer extends HTMLElement {
  constructor() {
    super();
    this.timeout = undefined;
    this.announcement = document.createElement('div');
    this.announcement.ariaLive = 'polite';
    this.appendChild(this.announcement);
  }

  announce(str) {
    this.announcement.innerText = str;
    this.timeout = setTimeout(() => {
      this.announcement.innerText = '';
    }, 1000);
  }
}

customElements.define('aria-announcer', AriaAnnouncer);

const announcer = new AriaAnnouncer();

try {
  document.body.appendChild(announcer);
} catch (error) {
  console.error(error);
}

export default () => {
  customElements.get('aria-announcer') || customElements.define('aria-announcer', AriaAnnouncer);
};
