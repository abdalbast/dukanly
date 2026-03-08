/**
 * Optimizes external image URLs for better delivery performance.
 * - Unsplash: reduces width parameter and requests WebP format
 * - Other URLs: returned unchanged
 */
export function optimizeImageUrl(url: string, displayWidth = 400): string {
  if (!url) return url;

  try {
    // Unsplash image optimization
    if (url.includes("images.unsplash.com")) {
      const u = new URL(url);
      // Set width to 2x display size for retina, capped at 800
      const targetW = Math.min(displayWidth * 2, 800);
      u.searchParams.set("w", String(targetW));
      u.searchParams.set("q", "75");
      u.searchParams.set("fm", "webp");
      u.searchParams.set("auto", "format");
      return u.toString();
    }
  } catch {
    // If URL parsing fails, return original
  }

  return url;
}
