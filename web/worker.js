/**
 * Village CRM — Cloudflare Worker.
 * Serves the static console from the ASSETS binding and adds sensible security
 * headers. SPA fallback is handled by wrangler's `not_found_handling`.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Clean route for the mobile app: /app and /app/ -> app.html (one deployment
    // serves both the desktop console at "/" and the mobile app at "/app").
    if (url.pathname === '/app' || url.pathname === '/app/') {
      const appReq = new Request(new URL('/app.html', url), request);
      const appRes = await env.ASSETS.fetch(appReq);
      const h = new Headers(appRes.headers);
      h.set('Cache-Control', 'no-cache');
      return new Response(appRes.body, { status: appRes.status, headers: h });
    }
    const res = await env.ASSETS.fetch(request);
    const headers = new Headers(res.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    // HTML is dynamic-ish (single file); let assets cache, keep index fresh.
    if (url.pathname === '/' || url.pathname.endsWith('.html')) {
      headers.set('Cache-Control', 'no-cache');
    }
    return new Response(res.body, { status: res.status, headers });
  },
};
