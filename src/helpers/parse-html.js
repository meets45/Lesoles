export default function parseHTML(html, selector = undefined, all = false) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (selector && !all) {
    return doc.querySelector(selector);
  }
  if (selector && all) {
    return doc.querySelectorAll(selector);
  }
  return doc;
}
