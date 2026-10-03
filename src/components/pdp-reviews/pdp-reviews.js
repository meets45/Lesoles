import './pdp-reviews.scss';

class PDPReviews extends HTMLElement {
  constructor() {
    super();
    this.elements = {
      ratingValue: this.querySelector('.pdp-reviews__header-rating-value'),
      reviewCount: this.querySelector('.pdp-reviews__content-inner-reviews-count'),
      stars: this.querySelectorAll('.pr-star-v4'),
    };

    this.init();
  }

  init() {
    // Start checking for PowerReviews data
    this.checkForPowerReviewsData();
  }

  checkForPowerReviewsData() {
    // Use MutationObserver to watch for changes in the document
    const observer = new MutationObserver((mutations, obs) => {
      // Check if the elements we need are now in the DOM
      const headlineElement = document.querySelector('.pr-review-snapshot-snippets-headline');
      const reviewCountElement = document.querySelector(
        '#pr-reviewsnippet .pr-snippet-review-count',
      );

      if (headlineElement && reviewCountElement) {
        // Make it so the review count element opens the modal
        reviewCountElement.setAttribute('data-drawer-trigger', 'reviews-drawer');
        // We found the elements, extract the data
        this.updateReviewData(headlineElement, reviewCountElement);
        // Stop observing once we've found what we need
        obs.disconnect();
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Set a timeout to stop observing after 10 seconds to prevent infinite observation
    setTimeout(() => {
      observer.disconnect();
    }, 10000);
  }

  updateReviewData(headlineElement, reviewCountElement) {
    // Extract the rating from the headline (e.g., "4.2 out of 5 stars")
    const ratingMatch = headlineElement.textContent.match(/(\d+\.\d+|\d+)/);
    let rating = ratingMatch ? parseFloat(ratingMatch[0]) : 0;

    // Round to the nearest tenth
    rating = Math.round(rating * 10) / 10;

    // Extract the review count (e.g., "365 Reviews")
    const countMatch = reviewCountElement.textContent.match(/(\d+)/);
    const count = countMatch ? countMatch[0] : '0';

    // Update the rating value
    if (this.elements.ratingValue) {
      this.elements.ratingValue.textContent = rating.toFixed(1);
    }

    // Update the review count
    if (this.elements.reviewCount) {
      this.elements.reviewCount.textContent = `${count} Reviews`;
    }

    // Update the stars based on the rating
    this.updateStars(rating);
  }

  updateStars(rating) {
    if (!this.elements.stars || this.elements.stars.length === 0) return;

    // Clear existing star classes
    this.elements.stars.forEach((star) => {
      star.className = 'pr-star-v4';
    });
    // Set the appropriate star classes based on the rating
    for (let i = 0; i < this.elements.stars.length; i++) {
      const star = this.elements.stars[i];

      if (rating >= i + 1) {
        // Full star
        star.classList.add('pr-star-v4-100-filled');
      } else if (rating >= i + 0.75) {
        // 3/4 star
        star.classList.add('pr-star-v4-75-filled');
      } else if (rating >= i + 0.5) {
        // Half star
        star.classList.add('pr-star-v4-50-filled');
      } else if (rating >= i + 0.25) {
        // 1/4 star
        star.classList.add('pr-star-v4-25-filled');
      } else {
        // Empty star
        star.classList.add('pr-star-v4-0-filled');
      }
    }
  }
}

export default () => {
  customElements.get('pdp-reviews') ||
    customElements.define('pdp-reviews', PDPReviews);
};
