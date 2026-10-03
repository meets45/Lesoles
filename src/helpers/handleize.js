const handleize = (string) => {
  if (!string) return '';

  return string
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^\w\u00C0-\u024f]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export default handleize;
