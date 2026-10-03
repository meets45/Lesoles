export function disableBodyScroll() {
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100vh';
}

export function enableBodyScroll() {
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('height');
}
