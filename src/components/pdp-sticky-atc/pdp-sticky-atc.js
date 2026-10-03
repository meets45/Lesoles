import './pdp-sticky-atc.scss';

class PdpStickyAtc extends HTMLElement {
  constructor() {
    super();
    this.reviewSection = document.querySelector('[data-pdp-review-section]');
    this.footer = document.querySelector('footer');
    this.isVisible = false;

    this.updateStickyAtc = this.updateStickyAtc.bind(this);

    // Add event listener for variant updates
    this.addEventListener('PRODUCT_VARIANT_UPDATE', this.handleVariantUpdate.bind(this));
  }

  connectedCallback() {
    // Add initial hidden state
    this.classList.add('pdp-sticky-atc--hidden');

    // Bind scroll handler
    this.onScroll = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScroll);
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.onScroll);
    if (this.addToCartButton) {
      this.addToCartButton.removeEventListener('click', this.handleAddToCart);
    }
  }

  onScroll() {
    if (!this.reviewSection || !this.footer) return;

    const viewportHeight = window.innerHeight;
    const reviewSectionTop = this.reviewSection.getBoundingClientRect().top;
    const footerTop = this.footer.getBoundingClientRect().top;

    // Show when 50vh away from review section
    const shouldShow = reviewSectionTop <= viewportHeight * 1.5 && footerTop > viewportHeight;

    if (shouldShow !== this.isVisible) {
      this.isVisible = shouldShow;
      this.classList.toggle('pdp-sticky-atc--hidden', !shouldShow);
    }
  }

  handleVariantUpdate(event) {
    const { variant } = event.detail;
    // Handle the variant update here

    this.updateStickyAtc(variant);
  }

  updateStickyAtc(variant) {
    if (!variant) return;

    const stickyImage = this.querySelector('img');
    const addToCartButton = this.querySelector('.pdp-sticky-atc__button');

    // Set variant ID first
    this.setAttribute('data-current-variant-id', variant.id);

    // Update image if available
    if (stickyImage && (variant.featured_image || variant.featured_media)) {
      const imageUrl = variant.featured_image?.src || variant.featured_media?.preview_image.src;
      if (imageUrl) {
        const tempImage = new Image();
        tempImage.onload = () => {
          stickyImage.src = imageUrl;
          stickyImage.srcset = `${imageUrl}&width=100 100w, ${imageUrl}&width=200 200w`;
        };
        tempImage.src = imageUrl;
      }
    }

    // Update button state based on variant availability
    if (addToCartButton) {
      const isAvailable = variant.available;
      addToCartButton.disabled = !isAvailable;
      addToCartButton.classList.toggle('pdp-sticky-atc__button--sold-out', !isAvailable);
      addToCartButton.textContent = isAvailable ? 'Add to Cart' : 'Sold Out';
    }
  }
}

export default () => {
  customElements.get('pdp-sticky-atc') ||
    customElements.define('pdp-sticky-atc', PdpStickyAtc);
};
