/** Components may subscribe to these events */
const EVENTS = {
  CART_ADD: 'CART_ADD',
  CART_OPEN: 'CART_OPEN',
  CART_UPDATE: 'CART_UPDATE',
  PRODUCT_VARIANT_UPDATE: 'PRODUCT_VARIANT_UPDATE',
  ADD_TO_CART: 'ADD_TO_CART',
  FILTER_UPDATE: 'FILTER_UPDATE',
  SEARCH_UPDATE: 'SEARCH_UPDATE',
  SHOPIFY_INSPECTOR_ACTIVATE: 'shopify:inspector:activate',
  SHOPIFY_INSPECTOR_DEACTIVATE: 'shopify:inspector:deactivate',
  SHOPIFY_SECTION_LOAD: 'shopify:section:load',
  SHOPIFY_SECTION_UNLOAD: 'shopify:section:unload',
  SHOPIFY_SECTION_SELECT: 'shopify:section:select',
  SHOPIFY_SECTION_DESELECT: 'shopify:section:deselect',
  SHOPIFY_SECTION_REORDER: 'shopify:section:reorder',
  SHOPIFY_BLOCK_SELECT: 'shopify:block:select',
  SHOPIFY_BLOCK_DESELECT: 'shopify:block:deselect',
};

export default EVENTS;
