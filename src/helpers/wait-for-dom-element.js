/**
 * Wait for a window variable to be defined before proceeding with function.
 * - Supports top-level variables (window.Shopify)
 * - Supports nested object variables (window.Shopify.theme)
 * @example
 * ```js
 * waitForDOMElement('#mmWrapper')
 * .then(() => {
 *   // Waits until `document.querySelector('#mmWrapper')` returns an element before proceeding.
 * })
 * ```
 * @param {String} selector - CSS Selector to wait for.
 * @return {Object}
 */
export const waitForDOMElement = (selector) => {
  /**
   * Wait for a maximum of 5 seconds at 0.05s intervals
   */
  let attempts = 0;

  const getElement = (resolve, reject) =>
    setTimeout(() => {
      if (attempts === 100) reject(`Error: document.querySelector('${selector}') timed out`);

      attempts++;

      const $el = document.querySelector(selector);

      return !$el ? getElement(resolve) : resolve($el);
    }, 50);

  return new Promise((resolve, reject) => {
    getElement(resolve, reject);
  });
};
