/**
 * Wait for a window variable to be defined before proceeding with function.
 * - Supports top-level variables (window.Shopify)
 * - Supports nested object variables (window.Shopify.theme)
 * @example
 * ```js
 * waitForWindowObject('Shopify')
 * .then(() => {
 *   // Waits until `window.Shopify` is defined before proceeding.
 * })
 * ```
 * @param {String} namespace - Named window variable to wait for.
 * @return {Object}
 */
export const waitForWindowObject = (namespace) => {
  /**
   * Wait for a maximum of 5 seconds at 0.05s intervals
   */
  let attempts = 0;

  const getObject = (resolve, reject) =>
    setTimeout(() => {
      if (attempts === 100) reject(`Error: window.${namespace} timed out`);

      attempts++;

      const ready = Object.hasOwn(window, namespace);

      return !ready ? getObject(resolve) : resolve(window[namespace]);
    }, 50);

  return new Promise((resolve, reject) => {
    getObject(resolve, reject);
  });
};
