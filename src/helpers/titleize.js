export default function titleize(str) {
  const a = str.toLowerCase().split(' ');
  for (let i = 0; i < a.length; i++) {
    a[i] = a[i].charAt(0).toUpperCase() + a[i].slice(1);
  }
  return a.join(' ');
}
