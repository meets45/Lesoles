/** Sets negative tabindexes on all keyboard focusable children of an element, or on the element itself */
export default function setTabIndexes(element, value) {
  const children = element.querySelectorAll('a,button,[tabindex],input');
  if (value === 0 || value === '0') {
    children.forEach((child) => {
      child.setAttribute('tabindex', '0');
    });
  }
  if (value === -1 || value === '-1') {
    children.forEach((child) => {
      child.setAttribute('tabindex', '-1');
    });
  }
}
