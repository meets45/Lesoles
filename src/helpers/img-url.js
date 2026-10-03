const imgUrl = (url, width, height) => {
  const match = url.match(/\.(png|jpg|jpeg|gif|webp)/);
  if (!match) return url;

  const { index } = match;
  const u = url.slice(0, index);

  // Create size string based on width and height, without cropping
  const r =
    width && height ? `${width}x${height}` : width ? `${width}x` : height ? `x${height}` : '';
  const l = url.slice(index);

  return `${u}_${r}${l}`;
};

export default imgUrl;
