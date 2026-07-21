/**
 * Village CRM — Cloudflare Worker.
 * Serves the static console from the ASSETS binding and adds sensible security
 * headers. SPA fallback is handled by wrangler's `not_found_handling`.
 */
export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
    const headers = new Headers(res.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    // HTML is dynamic-ish (single file); let assets cache, keep index fresh.
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname.endsWith('.html')) {
      headers.set('Cache-Control', 'no-cache');
    }
    return new Response(res.body, { status: res.status, headers });
  },
};
