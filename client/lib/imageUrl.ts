/**
 * Converts an image URL to an absolute URL.
 * Handles:
 *  - Already-absolute URLs (http:// or https://) → returned as-is
 *  - Relative /uploads/... paths (legacy data in DB) → prepended with backend base URL
 *  - Empty/undefined → returns empty string
 */
const API_SERVER = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Relative path like /uploads/image-123.jpg
  if (url.startsWith('/')) return `${API_SERVER}${url}`;
  return url;
}
