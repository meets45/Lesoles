import './main-blog.scss';

class MainBlog extends HTMLElement {
  constructor() {
    super();
    this.filterSelect = this.querySelector('[data-blog-filter]');
    this.bindEvents();
  }

  bindEvents() {
    if (!this.filterSelect) return;

    this.filterSelect.addEventListener('change', (event) => {
      const selectedTag = event.target.value;
      let url = window.location.pathname.split('/tagged/')[0]; // Remove any existing tag

      if (selectedTag) {
        url += '/tagged/' + selectedTag;
      }

      window.location.href = url;
    });
  }
}

export default () => {
  customElements.get('main-blog') || customElements.define('main-blog', MainBlog);
}
