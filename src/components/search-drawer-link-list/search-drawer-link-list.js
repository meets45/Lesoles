import './search-drawer-link-list.scss';

class SearchDrawerLinkList extends HTMLElement {
  constructor() {
    super();
    this.active = true;
    this.list = this.querySelector('ul');
    this.defaultLinks = this.list.querySelectorAll('[data-search-drawer-link]');
    this.defaultTitle = this.getAttribute('data-title');
    this.dynamicTitle = this.getAttribute('data-dynamic-title');
    this.linkTemplate = this.querySelector('[data-template]');
  }

  createLink({ text, url }) {
    const li = this.linkTemplate.querySelector('[data-search-drawer-link]').cloneNode(true);
    const a = li.querySelector('a');
    a.setAttribute('href', url);
    a.innerText = text;
    return li;
  }

  setLinks(links) {
    if (!links?.length) {
      this.active = false;
      return this.setAttribute('data-active', false);
    }
    this.active = true;
    this.setAttribute('data-active', true);
    const lis = links.map((link) => this.createLink(link));
    Array.from(this.list.children).forEach((c) => c.remove());
    lis.forEach((li) => this.list.appendChild(li));
  }

  reset() {
    Array.from(this.list.children).forEach((c) => c.remove());
    this.defaultLinks.forEach((li) => this.list.appendChild(li));
  }
}

export default () => {
  customElements.get('search-drawer-link-list') ||
    customElements.define('search-drawer-link-list', SearchDrawerLinkList);
};
