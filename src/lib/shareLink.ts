export type SearchParams = { [key: string]: string | string[] | undefined };

export const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

/** Rebuilds the canonical Universal Link for an entity from its query params. */
export function openInAppURL(entity: string, sp: SearchParams): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    const s = first(value);
    if (s) qs.set(key, s);
  }
  const query = qs.toString();
  // www is the canonical host that serves the AASA without a redirect, so the button hits a
  // verified Universal-Link host and opens the app.
  return `https://www.cisum.studio/${entity}${query ? `?${query}` : ""}`;
}
