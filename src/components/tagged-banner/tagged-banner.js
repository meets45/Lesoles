import './tagged-banner.scss';

class TaggedBanner extends HTMLElement {
  constructor() {
    super();
    this.activeCard = null;
    this.tagButtons = this.querySelectorAll('[data-tag-button]');
    this.productCards = this.querySelectorAll('[data-product-card]');

    this.handleTagClick = this.handleTagClick.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);

    this.init();
  }

  init() {
    // Add click handlers to tag buttons
    this.tagButtons.forEach((button) => {
      button.addEventListener('click', this.handleTagClick);
    });

    // Add document click handler for closing cards
    document.addEventListener('click', this.handleDocumentClick);
  }

  handleTagClick(event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const card = button.nextElementSibling;
    if (!card) return;

    // If clicking the same tag, close it
    if (this.activeCard === card) {
      this.closeCard();
      return;
    }

    // Close any open card before opening new one
    if (this.activeCard) {
      this.closeCard();
    }

    this.openCard(card, button);
  }

  openCard(card, button) {
    const buttonRect = button.getBoundingClientRect();
    const containerRect = this.getBoundingClientRect();

    // Position card relative to button
    this.positionCard(card, buttonRect, containerRect);

    // Show card
    card.hidden = false;
    this.activeCard = card;
  }

  closeCard() {
    if (!this.activeCard) return;

    this.activeCard.hidden = true;
    this.activeCard = null;
  }

  positionCard(card, buttonRect, containerRect) {
    const SPACING = 16; // Consistent spacing from edges
    const cardWidth = 300; // Width from CSS

    // Start with position below button
    let left = buttonRect.left - containerRect.left + buttonRect.width / 2 - cardWidth / 2;
    let top = buttonRect.bottom - containerRect.top + SPACING;

    // Keep card within horizontal bounds
    left = Math.max(SPACING, Math.min(left, containerRect.width - cardWidth - SPACING));

    // If card would extend below container, position above button
    const cardHeight = card.offsetHeight;
    if (top + cardHeight > containerRect.height - SPACING) {
      top = buttonRect.top - containerRect.top - cardHeight - SPACING;
    }

    // Apply position
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }

  handleDocumentClick(event) {
    // Close card if click is outside tag and card
    if (
      this.activeCard &&
      !event.target.closest('[data-tag-button]') &&
      !event.target.closest('[data-product-card]')
    ) {
      this.closeCard();
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleDocumentClick);
    this.tagButtons.forEach((button) => {
      button.removeEventListener('click', this.handleTagClick);
    });
  }
}

export default () => {
  customElements.get('tagged-banner') |
    customElements.define('tagged-banner', TaggedBanner);
};
