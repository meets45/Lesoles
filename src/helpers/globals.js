/**
 * This is an auto generated type, based on the Shopify window object. May change as implemented by Shopify.
 * @typedef {Object} Shopify
 * @property {string} shop - The shop domain.
 * @property {string} locale - The active locale code.
 * @property {Object} currency - Currency information.
 * @property {string} currency.active - The active currency code.
 * @property {string} currency.rate - The currency conversion rate to base currency.
 * @property {string} country - The country code.
 * @property {Object} theme - Theme information.
 * @property {string} theme.name - The name of the theme.
 * @property {number} theme.id - The unique identifier for the theme.
 * @property {string} theme.schema_name - The schema name of the theme.
 * @property {string} theme.schema_version - The version of the theme schema.
 * @property {?number} theme.theme_store_id - The ID of the theme in the store, or `null` if not available.
 * @property {string} theme.role - The theme's role, e.g., development.
 * @property {?string} theme.handle - The theme handle, or `null` if not set.
 * @property {Object} theme.style - Information about the theme style.
 * @property {?number} theme.style.id - The style ID, or `null` if not set.
 * @property {?string} theme.style.handle - The style handle, or `null` if not set.
 * @property {string} cdnHost - The CDN host URL.
 * @property {Object} routes - Routes information.
 * @property {string} routes.root - The root route of the application.
 * @property {Object} ce_forms - Custom elements form configuration.
 * @property {Array} ce_forms.q - Array for queued custom element forms.
 * @property {Object} captcha - Captcha settings.
 * @property {Object} PaymentButton - Payment button configuration.
 * @property {boolean} PaymentButton.isStorefrontPortableWallets - Flag for portable wallet compatibility.
 * @property {Object} customerPrivacy - Customer privacy settings.
 * @property {Object} customerPrivacy.unstable - Unstable customer privacy settings.
 * @property {Object} trackingConsent - Tracking consent configuration.
 * @property {Object} trackingConsent.unstable - Unstable tracking consent settings.
 * @property {Object} analytics - Analytics configuration.
 * @property {Array} analytics.replayQueue - Queue for replay events.
 * @property {boolean} modules - Whether modules are enabled.
 * @property {Object} featureAssets - Feature assets configuration.
 * @property {Object} featureAssets['shop-js'] - Shop JavaScript feature assets.
 */

/** @type {Shopify} */
export const Shopify = window.Shopify;

/**
 * @typedef variantStrings
 * @property {string} addToCart
 * @property {string} soldOut
 * @property {string} unavailable
 * @property {string} unavailable_with_option
 */

/** @type {variantStrings} */
export const variantStrings = window.variantStrings;
