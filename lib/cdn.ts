/** Builds the CDN-proxied image URL for a stored path. Never expose the raw Supabase URL. */
export function cdnImageUrl(path: string | null | undefined) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_CDN_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${path}`;
}
