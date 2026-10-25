import './footer.scss';

const initializeFooter = (footer) => {
  if (footer.dataset.footerInitialized === 'true') return;

  footer.dataset.footerInitialized = 'true';
  footer.dataset.footerReady = 'true';

  footer.addEventListener('click', (event) => {
    const toggle = event.target.closest?.('[data-footer-menu-toggle]');
    if (!toggle || !footer.contains(toggle)) return;

    const group = toggle.closest('[data-footer-menu-group]');
    const open = group.dataset.open !== 'true';

    footer.querySelectorAll('[data-footer-menu-group][data-open="true"]').forEach((openGroup) => {
      if (openGroup === group) return;
      openGroup.dataset.open = 'false';
      openGroup.querySelector('[data-footer-menu-toggle]')?.setAttribute('aria-expanded', 'false');
    });

    group.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  footer.addEventListener('change', (event) => {
    if (!event.target.matches?.('[data-footer-country-select]')) return;
    event.target.form?.requestSubmit();
  });
};

const initializeFooters = (root = document) => {
  if (root.matches?.('[data-component="footer"]')) initializeFooter(root);
  root.querySelectorAll?.('[data-component="footer"]').forEach(initializeFooter);
};

export default () => {
  initializeFooters();
  document.addEventListener('shopify:section:load', (event) => initializeFooters(event.target));
};
