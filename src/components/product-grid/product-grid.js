import './product-grid.scss';

import EVENTS from '@/helpers/events';
import SectionsAPIService from '@/helpers/sections-api-service';
import parseHTML from '@/helpers/parse-html';

class ProductGrid extends HTMLElement {
  constructor() {
    super();
    this.grid = this.querySelector('[data-product-grid]');
    this.sectionId = this.getAttribute('data-section-id') || 'main-product-grid';
    this.loadMoreButton = document.getElementById('load-more');
    this.loadMoreContainer = document.getElementById('load-more-container');

    if (this.loadMoreButton) {
      this.loadMoreButton.addEventListener('click', this.handleLoadMoreClick.bind(this));
    }

    // // Initialize filters from URL
    // this.filters.initializeFromUrl();
  }

  connectedCallback() {
    document.addEventListener(EVENTS.FILTER_UPDATE, this.render.bind(this));
    document.addEventListener(EVENTS.SEARCH_UPDATE, this.render.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener(EVENTS.FILTER_UPDATE, this.render.bind(this));
    document.removeEventListener(EVENTS.SEARCH_UPDATE, this.render.bind(this));
    if (this.loadMoreButton) {
      this.loadMoreButton.removeEventListener('click', this.handleLoadMoreClick.bind(this));
    }
  }

  handleLoadMoreClick(e) {
    e.preventDefault();
    this.loadMoreProducts();
  }

  loadMoreProducts() {
    const nextPagePath = this.loadMoreButton.getAttribute('data-next-page');

    if (nextPagePath) {
      const nextPageUrl = `${window.location.origin}${nextPagePath}`;
      this.fetchSection(nextPageUrl).then((sections) => {
        const parser = new DOMParser();
        const parsedDocument = parser.parseFromString(sections[this.sectionId], 'text/html');
        const newProducts = parsedDocument.querySelectorAll('.product-grid .product-card');
        newProducts.forEach((product) => {
          this.grid.appendChild(product);
        });

        const newLoadMoreButton = parsedDocument.querySelector('#load-more');
        if (newLoadMoreButton) {
          this.loadMoreButton.setAttribute(
            'data-next-page',
            newLoadMoreButton.getAttribute('data-next-page'),
          );
        } else {
          this.loadMoreContainer.querySelector('#load-more').remove(); // Remove the load more button if there are no more pages
          this.getCurrentProductCount();
        }
        if (this.loadMoreContainer && this.loadMoreContainer.parentElement) {
          this.loadMoreContainer.parentElement.appendChild(this.loadMoreContainer);
        }
        this.getCurrentProductCount();
      });
    }
  }

  getCurrentProductCount() {
    const productCards = this.grid.querySelectorAll('.product-card');
    const productCount = document.querySelector('.product__count');
    const progressBar = document.querySelector('.pagination-progress-bar__fill');
    const totalCount = parseInt(document.querySelector('[data-products_count]').textContent);

    productCount.innerText = `${productCards.length}`;

    if (progressBar) {
      const progress = (productCards.length / totalCount) * 100;
      progressBar.style.width = `${progress}%`;
      progressBar.setAttribute('aria-valuenow', Math.round(progress));
    }
  }

  async fetchSection(url) {
    const u = new URL(url);
    u.searchParams.append('sections', this.sectionId);
    return fetch(u.toString())
      .then((response) => response.json())
      .catch((error) => console.error('Error fetching section:', error));
  }

  /** Renders a new grid per the URL params */
  async render() {
    try {
      const text = await SectionsAPIService.fetch(window.location.href, this.sectionId);
      const nextGrid = parseHTML(text, '[data-product-grid]');
      const nextCount = parseHTML(text, '[data-product-count]');
      const nextLoadMoreContainer = parseHTML(text, '#load-more-container');
      const applyButton = document.querySelector('[data-filter-apply]');

      this.grid.innerHTML = nextGrid.innerHTML;

      // Update load more container
      if (nextLoadMoreContainer && this.loadMoreContainer) {
        this.loadMoreContainer.innerHTML = nextLoadMoreContainer.innerHTML;

        // Reattach event listener to new load more button
        this.loadMoreButton = document.getElementById('load-more');
        if (this.loadMoreButton) {
          this.loadMoreButton.addEventListener('click', this.handleLoadMoreClick.bind(this));
        }
      }

      // Update product count elements
      if (nextCount) {
        document.querySelectorAll('[data-product-count]').forEach((element) => {
          element.innerHTML = nextCount.innerHTML;
        });

        // Update apply button text if it exists
        if (applyButton) {
          const count = nextCount.textContent.match(/\d+/)?.[0] || '0';
          applyButton.textContent = window.strings.products.facets.apply_with_count.replace(
            '{{ count }}',
            count,
          );
        }
      }

      this.getCurrentProductCount();

    } catch (error) {
      console.error('Error:', error);
    }
  }
}

export default () => {
  customElements.get('product-grid') ||
    customElements.define('product-grid', ProductGrid);
};
