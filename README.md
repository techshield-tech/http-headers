# HTTP Headers Reference & Analyzer

Look up ~90 common HTTP request/response headers, then paste raw response headers to parse them and run a security & caching audit — fast, free, and 100% client-side. Your input is never sent over the network; everything runs in your browser.

**Live:** https://techshield-tech.github.io/http-headers/

Part of [MMOALL Developer Tools](https://mmoall.com/tools).

## Features

- **Reference tab** — ~90 common request/response headers covering general/standard,
  caching, CORS, security, fetch metadata, client hints, cookies, and
  deprecated/legacy categories. Each entry shows direction (request/response/both),
  a description, syntax, an example value, a spec citation, and a deprecated flag
  where applicable.
- Search by name/description and filter by category.
- **Analyzer tab** — paste raw response headers (e.g. the output of `curl -I`) and
  parse them client-side:
  - Optional leading status line.
  - Obsolete line folding/continuation lines.
  - Duplicate header names (e.g. multiple `Set-Cookie`), kept as separate entries.
  - Case-insensitive header name matching.
- A parsed-headers table plus a security & caching audit with pass/warn/fail
  results, covering:
  - `Strict-Transport-Security` presence, `max-age` ≥ 1 year, `includeSubDomains`.
  - `Content-Security-Policy` presence, flagging `unsafe-inline`, `unsafe-eval`,
    and wildcard (`*`) sources.
  - `X-Content-Type-Options: nosniff`.
  - Clickjacking protection via CSP `frame-ancestors` or `X-Frame-Options`.
  - `Referrer-Policy` presence and strictness.
  - `Permissions-Policy` presence.
  - `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy` presence.
  - `Set-Cookie` flags (`Secure`, `HttpOnly`, `SameSite`) per cookie.
  - CORS misconfiguration: `Access-Control-Allow-Origin: *` combined with
    `Access-Control-Allow-Credentials: true`.
  - Information leakage via `Server` / `X-Powered-By` revealing versions.
  - `Cache-Control` sanity checks (missing on sensitive responses, conflicting
    directives).
- **Build security headers** — pick from the standard recommended security
  headers and generate ready-to-paste config snippets for nginx, Apache
  (vhost/.htaccess), Express (Node.js, raw header-setting — no `helmet`
  dependency assumed), and Next.js (`next.config.js` `headers()`).
- No network requests anywhere in this tool. It only parses text you paste —
  this avoids the CORS restrictions that would otherwise block reading another
  site's response headers directly from a browser page, and keeps whatever you
  paste private to your own browser.
- Responsive down to 360px viewport width.

## Embedding

This tool can be embedded in an iframe, e.g. on mmoall.com. In embed mode it
renders only the tool itself (no header/footer) on a transparent background.

```html
<iframe
  id="http-headers"
  src="https://techshield-tech.github.io/http-headers/?embed=1&theme=dark"
  style="width: 100%; border: 0;"
  title="HTTP Headers Reference & Analyzer"
></iframe>

<script>
  const iframe = document.getElementById('http-headers');

  // Resize the iframe to fit its content.
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data && data.type === 'mmoall-tool:height' && data.slug === 'http-headers') {
      iframe.style.height = `${data.height}px`;
    }
    if (data && data.type === 'mmoall-tool:ready' && data.slug === 'http-headers') {
      // The tool has mounted and is ready.
    }
  });

  // Push a theme change into the iframe (only accepted from an allowed origin).
  iframe.contentWindow.postMessage({ type: 'mmoall-tool:theme', theme: 'dark' }, '*');
</script>
```

### Contract

- `?embed=1` in the URL renders only the tool (no chrome), transparent
  background.
- `?theme=light` / `?theme=dark` sets the initial theme; otherwise it follows
  `prefers-color-scheme`.
- The page listens for `window.postMessage({type:'mmoall-tool:theme', theme})`
  from the parent frame to change theme at runtime. Only messages whose
  `event.origin` is `https://mmoall.com`, `https://www.mmoall.com`, or
  `http://localhost:3000` are accepted.
- On mount (embed mode only), the page posts
  `{type:'mmoall-tool:ready', slug:'http-headers'}` to `window.parent`.
- Whenever its rendered height changes (embed mode only), the page posts
  `{type:'mmoall-tool:height', slug:'http-headers', height}` to
  `window.parent`.

## Local development

```bash
bun install
bun dev
```

Build for production:

```bash
bun run build
```

Deployment to GitHub Pages happens automatically via
`.github/workflows/deploy.yml` on every push to `main`.

## License

MIT — see [LICENSE](./LICENSE).
