const IMG_HOST = 'https://cdn.steamstatic.com';

export function heroImageUrl(path?: string | null): string {
  if (!path) return '/placeholder-hero.png';
  if (path.startsWith('http')) return path;
  return `${IMG_HOST}${path}`;
}

export function heroIconUrl(path?: string | null): string {
  if (!path) return '/placeholder-hero.png';
  if (path.startsWith('http')) return path;
  return `${IMG_HOST}${path}`;
}

export function abilityImageUrl(imgPath?: string | null): string | null {
  if (!imgPath) return null;
  if (imgPath.startsWith('http')) return imgPath;
  return `${IMG_HOST}${imgPath}`;
}

export function itemImageUrl(itemName?: string | null): string | null {
  if (!itemName) return null;
  if (itemName.startsWith('http')) return itemName;

  const normalizedItemName = itemName.startsWith('items/')
    ? itemName
    : `items/${itemName}`;

  const fileName = normalizedItemName.endsWith('.png')
    ? normalizedItemName
    : `${normalizedItemName}.png`;

  return `${IMG_HOST}/apps/dota2/images/dota_react/${fileName}`;
}

export function teamLogoUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${IMG_HOST}${path}`;
}
