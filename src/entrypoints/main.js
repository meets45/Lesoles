import { waitForWindowObject } from '@/helpers/wait-for-window-object';

const $components = document.querySelectorAll('[data-component]');
const components = new Set(
  Array.from($components).map(($component) => {
    let {
      dataset: { component },
    } = $component;

    return component;
  }),
);

const init = async () => {
  // run each component sequentially
  for (const component of components) {
    try {
      const module = await import(`~components/${component}/${component}.js`);

      module.default();
    } catch (err) {
      console.error(`Error loading component ${component}:`, err);
    }
  }
  requestAnimationFrame(() => document.body.style.visibility = '');

  const Shopify = await waitForWindowObject('Shopify');

  if (Shopify.designMode) {
    for (const $component of $components) {
      document.addEventListener('shopify:section:load', () => $component.connectedCallback?.());

      document.addEventListener('shopify:section:unload', () => $component.disconnectedCallback?.());

      // run each component on a select section
      document.addEventListener('shopify:section:select', (event) => {
        const $elements = event.target.querySelectorAll('[data-component]');

        for (const $element of $elements) {
          $element?.handleSectionSelect?.();
        }
      });

      // run each component on a deselect section
      document.addEventListener('shopify:section:deselect', (event) => {
        const $elements = event.target.querySelectorAll('[data-component]');

        for (const $element of $elements) {
          $element?.handleSectionDeselect?.();
        }
      });

      // document.addEventListener('shopify:block:select',
      // () => (...));
    }
  }
};

init();
