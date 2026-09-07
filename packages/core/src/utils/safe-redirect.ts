/**
 * Returns `raw` only if it is a safe same-origin path, else `fallback`.
 *
 * Callers pass the result to `new URL(next, request.url)`, which silently
 * ignores the base when `next` is absolute — so an unvalidated `?next=` on a
 * middleware-exempt callback route is an open redirect.
 *
 * Rejects absolute URLs, protocol-relative `//host`, and the `/\host` form
 * that some browsers also normalise to protocol-relative.
 */
export function safeRedirectPath(raw: string | null | undefined, fallback: string): string {
    if (!raw) return fallback;
    if (!raw.startsWith('/')) return fallback;
    if (raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
    return raw;
}
