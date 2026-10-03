import EVENTS from '@/helpers/events';
import SwiperSlider from '@/helpers/swiper-slider';
import SectionsAPIService from '@/helpers/sections-api-service';
import parseHTML from '@/helpers/parse-html';
import './product-media-gallery.scss';

class ProductMediaGallery extends HTMLElement {
  constructor() {
    super();
    this.swiper = undefined;
    this.mode = this.getAttribute('data-mode');
    this.isCard = this.hasAttribute('data-is-card');
    this.swiperContainer = this.querySelector('.swiper-wrapper');
    this.mobileBreakpoint = 769; // Define breakpoint

    // Only initialize modal elements if not in a card
    if (!this.isCard) {
      this.modal = this.querySelector('.main-product__media-modal');
      this.modalImageContainer = this.querySelector('.main-product__media-modal-image-container');
      this.modalImage = this.querySelector('.main-product__media-modal-image');
      this.modalClose = this.querySelector('.main-product__media-modal-close');
      this.modalThumbnails = this.querySelectorAll('[data-modal-thumbnail]');
      this.handleImageClick = this.handleImageClick.bind(this);
      this.closeModal = this.closeModal.bind(this);
      this.handleModalClick = this.handleModalClick.bind(this);
      this.handleModalImageClick = this.handleModalImageClick.bind(this);
      this.handleModalImageMouseMove = this.handleModalImageMouseMove.bind(this);
      this.handleModalImageMouseLeave = this.handleModalImageMouseLeave.bind(this);
      this.handleThumbnailClick = this.handleThumbnailClick.bind(this);
    }
  }

  connectedCallback() {
    // Only initialize if below breakpoint
    if (this.mode == 'compact' || window.innerWidth < this.mobileBreakpoint) {
      this.initSwiper();
    }
    window.addEventListener('resize', this.handleResize.bind(this));
    this.addEventListener(
      EVENTS.PRODUCT_VARIANT_UPDATE,
      this.handleProductVariantUpdate.bind(this),
    );

    // Add click handlers for fullscreen modal only if not in a card
    if (!this.isCard && window.innerWidth >= this.mobileBreakpoint) {
      this.querySelectorAll('.product-media-gallery__button').forEach((button) => {
        button.addEventListener('click', this.handleImageClick);
      });
      this.modalClose?.addEventListener('click', this.handleModalClose.bind(this));
      this.modal?.addEventListener('click', this.handleModalClick);
      this.modalImageContainer?.addEventListener('click', this.handleModalImageClick);
      this.modalImageContainer?.addEventListener('mousemove', this.handleModalImageMouseMove);
      this.modalImageContainer?.addEventListener('mouseleave', this.handleModalImageMouseLeave);
      this.modalThumbnails?.forEach((thumbnail) => {
        thumbnail.addEventListener('click', this.handleThumbnailClick);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeModal();
      });
    }
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.removeEventListener(
      EVENTS.PRODUCT_VARIANT_UPDATE,
      this.handleProductVariantUpdate.bind(this),
    );

    // Remove modal event listeners only if not in a card
    if (!this.isCard) {
      this.querySelectorAll('.product-media-gallery__button').forEach((button) => {
        button.removeEventListener('click', this.handleImageClick);
      });
      this.modalClose?.removeEventListener('click', this.handleModalClose.bind(this));
      this.modal?.removeEventListener('click', this.handleModalClick);
      this.modalImageContainer?.removeEventListener('click', this.handleModalImageClick);
      this.modalImageContainer?.removeEventListener('mousemove', this.handleModalImageMouseMove);
      this.modalImageContainer?.removeEventListener('mouseleave', this.handleModalImageMouseLeave);
      this.modalThumbnails?.forEach((thumbnail) => {
        thumbnail.removeEventListener('click', this.handleThumbnailClick);
      });
    }
  }

  handleModalImageClick(e) {
    e.stopPropagation(); // Prevent modal from closing
    const isZoomed = this.modalImageContainer.getAttribute('data-zoomed') === 'true';

    if (!isZoomed) {
      // Set zoom state and transform
      this.modalImageContainer.setAttribute('data-zoomed', 'true');
      const rect = this.modalImageContainer.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      this.modalImage.style.transformOrigin = `${x}% ${y}%`;
      this.modalImage.style.transform = 'scale(2.5)';
    } else {
      // Reset zoom
      this.modalImageContainer.setAttribute('data-zoomed', 'false');
      this.modalImage.style.transformOrigin = 'center';
      this.modalImage.style.transform = 'scale(1)';
    }
  }

  handleModalImageMouseMove(e) {
    if (this.modalImageContainer.getAttribute('data-zoomed') !== 'true') return;

    const rect = this.modalImageContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    this.modalImage.style.transformOrigin = `${x}% ${y}%`;
    this.modalImage.style.transform = 'scale(2.5)';
  }

  handleModalImageMouseLeave() {
    if (this.modalImageContainer.getAttribute('data-zoomed') === 'true') {
      this.modalImageContainer.setAttribute('data-zoomed', 'false');
      this.modalImage.style.transformOrigin = 'center';
      this.modalImage.style.transform = 'scale(1)';
    }
  }

  handleModalClick(e) {
    // Close only if clicking the background (modal itself), not its children
    if (e.target === this.modal) {
      this.closeModal();
    }
  }

  handleThumbnailClick(e) {
    const thumbnail = e.currentTarget;
    const imageUrl = thumbnail.getAttribute('data-image-url');

    // Update active state
    this.modalThumbnails.forEach((t) => t.removeAttribute('data-active'));
    thumbnail.setAttribute('data-active', 'true');

    // Update main image
    if (this.modalImage && imageUrl) {
      this.modalImage.src = imageUrl;
      // Reset zoom state
      this.modalImageContainer?.setAttribute('data-zoomed', 'false');
      this.modalImage.style.transformOrigin = 'center';
      this.modalImage.style.transform = 'scale(1)';
    }
  }

  handleImageClick(e) {
    const button = e.currentTarget;
    const img = button.querySelector('img');
    if (this.modal && this.modalImage && img) {
      this.modalImage.src = img.src;
      this.modal.setAttribute('data-active', 'true');
      document.body.style.overflow = 'hidden';

      // Set active thumbnail
      const activeThumb = Array.from(this.modalThumbnails).find(
        (thumbnail) => thumbnail.getAttribute('data-image-url') === img.src,
      );

      this.modalThumbnails.forEach((thumbnail) => {
        thumbnail.removeAttribute('data-active');
      });

      if (activeThumb) {
        activeThumb.setAttribute('data-active', 'true');
      }

      // Reset zoom state
      this.modalImageContainer?.setAttribute('data-zoomed', 'false');
      this.modalImage.style.transformOrigin = 'center';
      this.modalImage.style.transform = 'scale(1)';
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.setAttribute('data-active', 'false');
      document.body.style.overflow = '';
      // Reset zoom state
      this.modalImageContainer?.setAttribute('data-zoomed', 'false');
      this.modalImage.style.transformOrigin = 'center';
      this.modalImage.style.transform = 'scale(1)';
    }
  }

  handleModalClose(e) {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling up
    this.closeModal();
  }

  initSwiper() {
    if (!this.swiper) {
      this.swiper = new SwiperSlider(this, {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: false,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          prevEl: '[data-swiper-prev]',
          nextEl: '[data-swiper-next]',
        },
        touchEventsTarget: 'wrapper',
        touchRatio: 1,
        touchAngle: 45,
        grabCursor: true,
        allowTouchMove: true,
        observer: true,
        observeParents: true,
      })?.swiper;
    }
  }

  destroySwiper() {
    if (this.swiper) {
      console.log('destroying');
      console.log(this.swiper);
      this.swiper.destroy(true, true);
      this.swiper = undefined;
    }
  }

  handleResize() {
    // Destroy all carousels if above breakpoint
    if (this.mode === 'default' && window.innerWidth > this.mobileBreakpoint) {
      this.destroySwiper();
    }
    // Initialize carousels if below breakpoint and none exist
    else {
      this.initSwiper();
    }
  }

  async handleProductVariantUpdate(e) {
    const { product, variant } = e.detail;

    // Check if this event is meant for this gallery
    const productId = this.getAttribute('data-product-id');
    if (productId && productId !== product.id.toString()) {
      return;
    }

    // fetch a gallery via the sections API
    const url = new URL(
      `${window.location.origin}/products/${product.handle}?variant=${variant.id}`,
    );
    const text = await SectionsAPIService.fetch(url, 'product-media-gallery');

    // get the slides from this gallery
    const slides = parseHTML(text, '[data-swiper-slide]', true);

    // If this is a card, replace buttons with links
    if (this.isCard) {
      slides.forEach((slide) => {
        const button = slide.querySelector('.product-media-gallery__button');
        if (button) {
          const img = button.querySelector('img');
          const link = document.createElement('a');
          link.href = `/products/${product.handle}?variant=${variant.id}`;
          link.className = 'product-media-gallery__link';
          link.appendChild(img.cloneNode(true));
          button.replaceWith(link);
        }
      });
    } else {
      // Create a temporary container to parse the full HTML
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = text;

      // Find the thumbnails container in the new content
      const newThumbnailsContainer = tempContainer.querySelector(
        '.main-product__media-modal-thumbnails',
      );

      if (newThumbnailsContainer) {
        // Update the existing thumbnails container
        const currentThumbnailsContainer = this.querySelector(
          '.main-product__media-modal-thumbnails',
        );
        if (currentThumbnailsContainer) {
          currentThumbnailsContainer.innerHTML = newThumbnailsContainer.innerHTML;

          // Update the thumbnails reference and reattach handlers
          this.modalThumbnails =
            currentThumbnailsContainer.querySelectorAll('[data-modal-thumbnail]');
          this.modalThumbnails.forEach((thumbnail) => {
            thumbnail.addEventListener('click', this.handleThumbnailClick);
          });
        }
      }
    }

    if (this.swiper) {
      // remove slides from the current swiper
      this.swiper.removeAllSlides();
      this.swiper.appendSlide(slides);
    } else {
      this.swiperContainer.replaceChildren(...slides);
    }

    // Reattach click handlers for modal if not in card mode
    if (!this.isCard && window.innerWidth >= this.mobileBreakpoint) {
      this.querySelectorAll('.product-media-gallery__button').forEach((button) => {
        button.addEventListener('click', this.handleImageClick);
      });
    }
  }
}

export default () => {
  customElements.get('product-media-gallery') ||
    customElements.define('product-media-gallery', ProductMediaGallery);
};
