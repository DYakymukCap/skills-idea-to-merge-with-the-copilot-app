export function normalizeUrl(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;

  const withProtocol = /^[a-z][a-z\d+\-.]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.href;
  } catch {
    return null;
  }
}

export function encodeBase62(value) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let number = Number.isSafeInteger(value) && value >= 0 ? value : 0;
  if (number === 0) return '0';

  let encoded = '';
  while (number > 0) {
    encoded = alphabet[number % 62] + encoded;
    number = Math.floor(number / 62);
  }
  return encoded;
}

export function nextSlug(bookmarks, counter) {
  let nextCounter = Number.isSafeInteger(counter) && counter >= 0 ? counter : 0;
  let slug;

  do {
    slug = `mona-${encodeBase62(nextCounter)}`;
    nextCounter += 1;
  } while (bookmarks.some((bookmark) => bookmark.slug === slug));

  return { slug, counter: nextCounter };
}

export function parseStoredBookmarks(storedValue) {
  if (typeof storedValue !== 'string' || storedValue.trim() === '') return [];

  try {
    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
      if (typeof item.url !== 'string' || typeof item.slug !== 'string') return [];

      const url = normalizeUrl(item.url);
      if (!url || !/^mona-[0-9A-Za-z]+$/.test(item.slug)) return [];
      return [{ url, slug: item.slug }];
    });
  } catch {
    return [];
  }
}

export function formatBookmark(bookmark) {
  return `${bookmark.url} :: ${bookmark.slug}`;
}
