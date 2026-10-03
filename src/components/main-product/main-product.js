import './main-product.scss';

export default () => {
  const reviewSummaryButton = document.querySelector(
    '.main-product__content-review-summary-button',
  );
  const reviewSummary = document.querySelector('.main-product__accordions-reviews');

  reviewSummaryButton.addEventListener('click', () => {
    reviewSummary.scrollIntoView({ behavior: 'smooth' });
  });


  // Apple Pay Button logic
  const applePayButton = document.querySelector('.product-form__apple-pay');
  const addToCartButton = document.querySelector('#add-to-cart');

  // Check if we're on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isMobile = window.innerWidth <= 768;

  if (applePayButton && isIOS && isMobile) {
    applePayButton.classList.add('mobile');
    addToCartButton.classList.add('with-apple-pay');
  }
};
