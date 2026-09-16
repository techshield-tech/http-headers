// Static reference data for ~90 common HTTP request/response headers.
// Pure data, no framework dependencies. Tool-specific.

export type HeaderDirection = 'request' | 'response' | 'both';

export type HeaderCategory =
  | 'general'
  | 'caching'
  | 'cors'
  | 'security'
  | 'fetch-metadata'
  | 'client-hints'
  | 'cookies'
  | 'deprecated';

export interface HeaderDefinition {
  /** Canonical header name, e.g. "Content-Type". */
  name: string;
  direction: HeaderDirection;
  category: HeaderCategory;
  description: string;
  syntax: string;
  example: string;
  /** Spec reference text, e.g. "RFC 9110 §8.3" — not a link, just a citation. */
  spec: string;
  /** True for headers that are obsolete, deprecated, or removed from modern browsers. */
  deprecated?: boolean;
}

export const HEADER_CATEGORY_LABELS: Record<HeaderCategory, string> = {
  general: 'General',
  caching: 'Caching',
  cors: 'CORS',
  security: 'Security',
  'fetch-metadata': 'Fetch Metadata',
  'client-hints': 'Client Hints',
  cookies: 'Cookies',
  deprecated: 'Deprecated / Legacy',
};

export const HEADER_CATEGORIES: HeaderCategory[] = [
  'general',
  'caching',
  'cors',
  'security',
  'fetch-metadata',
  'client-hints',
  'cookies',
  'deprecated',
];

export const HEADER_DIRECTION_LABELS: Record<HeaderDirection, string> = {
  request: 'Request',
  response: 'Response',
  both: 'Both',
};

export const HEADERS: HeaderDefinition[] = [
  // ---- General / standard -------------------------------------------------
  {
    name: 'Host',
    direction: 'request',
    category: 'general',
    description:
      "Specifies the domain name (and optionally port) of the server the request is being sent to. Required on every HTTP/1.1 request.",
    syntax: 'Host: <host>[:<port>]',
    example: 'Host: example.com',
    spec: 'RFC 9110 §7.2',
  },
  {
    name: 'User-Agent',
    direction: 'request',
    category: 'general',
    description:
      'Identifies the client application, its version, and often the OS/device making the request.',
    syntax: 'User-Agent: <product> [<product>/<version>] ...',
    example: 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    spec: 'RFC 9110 §10.1.5',
  },
  {
    name: 'Accept',
    direction: 'request',
    category: 'general',
    description:
      'Tells the server which media types the client can process, with optional quality weights.',
    syntax: 'Accept: <mime-type>[;q=<weight>], ...',
    example: 'Accept: text/html,application/json;q=0.9,*/*;q=0.8',
    spec: 'RFC 9110 §12.5.1',
  },
  {
    name: 'Accept-Encoding',
    direction: 'request',
    category: 'general',
    description: 'Lists the content-coding(s) (compression algorithms) the client can decode.',
    syntax: 'Accept-Encoding: gzip, deflate, br',
    example: 'Accept-Encoding: gzip, deflate, br',
    spec: 'RFC 9110 §12.5.3',
  },
  {
    name: 'Accept-Language',
    direction: 'request',
    category: 'general',
    description:
      'Lists natural languages the client prefers for the response, with optional quality weights.',
    syntax: 'Accept-Language: <lang>[;q=<weight>], ...',
    example: 'Accept-Language: en-US,en;q=0.9,vi;q=0.8',
    spec: 'RFC 9110 §12.5.4',
  },
  {
    name: 'Accept-Charset',
    direction: 'request',
    category: 'general',
    description:
      'Lists character encodings the client can understand. Rarely sent today — UTF-8 is assumed almost everywhere.',
    syntax: 'Accept-Charset: <charset>[;q=<weight>], ...',
    example: 'Accept-Charset: utf-8',
    spec: 'RFC 9110 §12.5.2',
  },
  {
    name: 'Content-Type',
    direction: 'both',
    category: 'general',
    description:
      'Indicates the media type of the request or response body, and optionally its character encoding.',
    syntax: 'Content-Type: <mime-type>[; charset=<charset>]',
    example: 'Content-Type: application/json; charset=utf-8',
    spec: 'RFC 9110 §8.3',
  },
  {
    name: 'Content-Length',
    direction: 'both',
    category: 'general',
    description: 'The size of the message body in decimal bytes.',
    syntax: 'Content-Length: <bytes>',
    example: 'Content-Length: 1348',
    spec: 'RFC 9110 §8.6',
  },
  {
    name: 'Content-Encoding',
    direction: 'response',
    category: 'general',
    description:
      'The content-coding(s) applied to the body, which the client must decode to obtain the original media type.',
    syntax: 'Content-Encoding: gzip | br | deflate | identity',
    example: 'Content-Encoding: gzip',
    spec: 'RFC 9110 §8.4',
  },
  {
    name: 'Content-Language',
    direction: 'response',
    category: 'general',
    description: 'The natural language(s) the body is intended for.',
    syntax: 'Content-Language: <lang>',
    example: 'Content-Language: en-US',
    spec: 'RFC 9110 §8.5',
  },
  {
    name: 'Content-Disposition',
    direction: 'response',
    category: 'general',
    description:
      'Suggests whether the body should be displayed inline or downloaded as an attachment, and a suggested filename.',
    syntax: 'Content-Disposition: inline | attachment[; filename="<name>"]',
    example: 'Content-Disposition: attachment; filename="report.pdf"',
    spec: 'RFC 6266',
  },
  {
    name: 'Transfer-Encoding',
    direction: 'response',
    category: 'general',
    description:
      'The encoding used to safely transfer the body (e.g. chunked), distinct from Content-Encoding.',
    syntax: 'Transfer-Encoding: chunked | gzip | deflate',
    example: 'Transfer-Encoding: chunked',
    spec: 'RFC 9112 §6.1',
  },
  {
    name: 'Connection',
    direction: 'both',
    category: 'general',
    description:
      'Controls whether the network connection stays open after the current transaction, and lists hop-by-hop headers to remove.',
    syntax: 'Connection: keep-alive | close',
    example: 'Connection: keep-alive',
    spec: 'RFC 9110 §7.6.1',
  },
  {
    name: 'Date',
    direction: 'response',
    category: 'general',
    description: 'The date and time the message was originated, in HTTP-date format.',
    syntax: 'Date: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT',
    example: 'Date: Tue, 15 Sep 2026 08:00:00 GMT',
    spec: 'RFC 9110 §6.6.1',
  },
  {
    name: 'Server',
    direction: 'response',
    category: 'general',
    description:
      'Identifies the software (and often version) handling the request at the origin server.',
    syntax: 'Server: <product>[/<version>] ...',
    example: 'Server: nginx/1.25.3',
    spec: 'RFC 9110 §10.2.4',
  },
  {
    name: 'Location',
    direction: 'response',
    category: 'general',
    description:
      'The URL to redirect to (3xx responses) or the URL of a newly created resource (201).',
    syntax: 'Location: <url>',
    example: 'Location: https://example.com/new-page',
    spec: 'RFC 9110 §10.2.2',
  },
  {
    name: 'Retry-After',
    direction: 'response',
    category: 'general',
    description:
      'How long the client should wait before retrying, used with 3xx/429/503 responses.',
    syntax: 'Retry-After: <seconds> | <HTTP-date>',
    example: 'Retry-After: 120',
    spec: 'RFC 9110 §10.2.3',
  },
  {
    name: 'Allow',
    direction: 'response',
    category: 'general',
    description:
      'Lists the HTTP methods supported by the target resource, sent with 405 responses or on OPTIONS.',
    syntax: 'Allow: <method>, ...',
    example: 'Allow: GET, POST, HEAD',
    spec: 'RFC 9110 §10.2.1',
  },
  {
    name: 'Range',
    direction: 'request',
    category: 'general',
    description: 'Requests only part of a resource, by byte range.',
    syntax: 'Range: bytes=<start>-<end>',
    example: 'Range: bytes=0-1023',
    spec: 'RFC 9110 §14.2',
  },
  {
    name: 'Content-Range',
    direction: 'response',
    category: 'general',
    description:
      'Indicates where in the full body a partial response belongs, used with 206 Partial Content.',
    syntax: 'Content-Range: bytes <start>-<end>/<total>',
    example: 'Content-Range: bytes 0-1023/4096',
    spec: 'RFC 9110 §14.4',
  },
  {
    name: 'Accept-Ranges',
    direction: 'response',
    category: 'general',
    description: 'Advertises that the server supports range requests for this resource.',
    syntax: 'Accept-Ranges: bytes | none',
    example: 'Accept-Ranges: bytes',
    spec: 'RFC 9110 §14.3',
  },
  {
    name: 'If-Match',
    direction: 'request',
    category: 'general',
    description:
      "Makes the request conditional on the resource's current ETag matching, used for optimistic concurrency control.",
    syntax: 'If-Match: "<etag>" | *',
    example: 'If-Match: "33a64df551"',
    spec: 'RFC 9110 §13.1.1',
  },
  {
    name: 'If-Unmodified-Since',
    direction: 'request',
    category: 'general',
    description:
      'Makes the request conditional on the resource not having changed since the given date.',
    syntax: 'If-Unmodified-Since: <HTTP-date>',
    example: 'If-Unmodified-Since: Tue, 15 Sep 2026 08:00:00 GMT',
    spec: 'RFC 9110 §13.1.4',
  },
  {
    name: 'If-Modified-Since',
    direction: 'request',
    category: 'general',
    description:
      "Makes a GET conditional: the server returns 304 Not Modified if the resource hasn't changed since this date.",
    syntax: 'If-Modified-Since: <HTTP-date>',
    example: 'If-Modified-Since: Tue, 15 Sep 2026 08:00:00 GMT',
    spec: 'RFC 9110 §13.1.3',
  },
  {
    name: 'If-Range',
    direction: 'request',
    category: 'general',
    description:
      'Combined with Range: completes a partial download only if the validator still matches, otherwise the full resource is returned.',
    syntax: 'If-Range: "<etag>" | <HTTP-date>',
    example: 'If-Range: "33a64df551"',
    spec: 'RFC 9110 §13.1.5',
  },
  {
    name: 'Authorization',
    direction: 'request',
    category: 'general',
    description: 'Carries client credentials for authenticating with a server.',
    syntax: 'Authorization: <scheme> <credentials>',
    example: 'Authorization: Bearer eyJhbGciOi...',
    spec: 'RFC 9110 §11.6.2',
  },
  {
    name: 'WWW-Authenticate',
    direction: 'response',
    category: 'general',
    description:
      'Sent with 401 responses to indicate which authentication scheme(s) the server accepts.',
    syntax: 'WWW-Authenticate: <scheme> realm="<realm>"',
    example: 'WWW-Authenticate: Basic realm="Access to site"',
    spec: 'RFC 9110 §11.6.1',
  },
  {
    name: 'Proxy-Authenticate',
    direction: 'response',
    category: 'general',
    description:
      'Sent with 407 responses to indicate the authentication scheme a proxy requires.',
    syntax: 'Proxy-Authenticate: <scheme> realm="<realm>"',
    example: 'Proxy-Authenticate: Basic realm="proxy"',
    spec: 'RFC 9110 §11.7.1',
  },
  {
    name: 'Proxy-Authorization',
    direction: 'request',
    category: 'general',
    description: 'Carries client credentials for authenticating with a proxy.',
    syntax: 'Proxy-Authorization: <scheme> <credentials>',
    example: 'Proxy-Authorization: Basic dXNlcjpwYXNz',
    spec: 'RFC 9110 §11.7.2',
  },
  {
    name: 'Referer',
    direction: 'request',
    category: 'general',
    description:
      'The URL of the page that linked to the requested resource. Note the historical misspelling in the header name.',
    syntax: 'Referer: <url>',
    example: 'Referer: https://example.com/search?q=headers',
    spec: 'RFC 9110 §10.1.3',
  },
  {
    name: 'Forwarded',
    direction: 'request',
    category: 'general',
    description:
      'Standardized way for proxies to disclose original client/protocol info, intended to replace the X-Forwarded-* headers.',
    syntax: 'Forwarded: for=<ip>;proto=<proto>;by=<ip>',
    example: 'Forwarded: for=203.0.113.4;proto=https',
    spec: 'RFC 7239',
  },
  {
    name: 'X-Forwarded-For',
    direction: 'request',
    category: 'general',
    description:
      'De facto standard listing the originating client IP (and any intermediate proxies) when a request passes through a proxy or load balancer.',
    syntax: 'X-Forwarded-For: <client>, <proxy1>, ...',
    example: 'X-Forwarded-For: 203.0.113.4, 198.51.100.2',
    spec: 'De facto standard (not in an RFC)',
  },
  {
    name: 'X-Forwarded-Proto',
    direction: 'request',
    category: 'general',
    description:
      'De facto standard indicating the original protocol (http/https) used by the client when talking to a proxy.',
    syntax: 'X-Forwarded-Proto: http | https',
    example: 'X-Forwarded-Proto: https',
    spec: 'De facto standard (not in an RFC)',
  },
  {
    name: 'X-Forwarded-Host',
    direction: 'request',
    category: 'general',
    description:
      'De facto standard indicating the original Host requested by the client when talking to a proxy.',
    syntax: 'X-Forwarded-Host: <host>',
    example: 'X-Forwarded-Host: example.com',
    spec: 'De facto standard (not in an RFC)',
  },
  {
    name: 'Via',
    direction: 'both',
    category: 'general',
    description: 'Records the intermediate protocols and proxies through which a message passed.',
    syntax: 'Via: <protocol> <host>, ...',
    example: 'Via: 1.1 proxy1.example.com',
    spec: 'RFC 9110 §7.6.3',
  },
  {
    name: 'Upgrade',
    direction: 'both',
    category: 'general',
    description:
      'Requests or confirms switching the connection to a different protocol, e.g. WebSocket.',
    syntax: 'Upgrade: <protocol>/<version>',
    example: 'Upgrade: websocket',
    spec: 'RFC 9110 §7.8',
  },
  {
    name: 'Expect',
    direction: 'request',
    category: 'general',
    description:
      "Indicates expectations the client requires the server to fulfil, most commonly `100-continue`.",
    syntax: 'Expect: 100-continue',
    example: 'Expect: 100-continue',
    spec: 'RFC 9110 §10.1.1',
  },
  {
    name: 'Link',
    direction: 'response',
    category: 'general',
    description: 'Conveys relationships to other resources, e.g. preload hints or pagination links.',
    syntax: 'Link: <<url>>; rel="<relation>"',
    example: 'Link: </style.css>; rel=preload; as=style',
    spec: 'RFC 8288',
  },
  {
    name: 'Content-Location',
    direction: 'response',
    category: 'general',
    description: 'Indicates an alternate location for the returned representation of the resource.',
    syntax: 'Content-Location: <url>',
    example: 'Content-Location: /documents/report.en.html',
    spec: 'RFC 9110 §8.7',
  },

  // ---- Caching --------------------------------------------------------------
  {
    name: 'Cache-Control',
    direction: 'both',
    category: 'caching',
    description:
      'Directives controlling caching behavior in both requests and responses (freshness, revalidation, storage).',
    syntax: 'Cache-Control: <directive>[, <directive>]',
    example: 'Cache-Control: no-cache, max-age=0',
    spec: 'RFC 9111 §5.2',
  },
  {
    name: 'ETag',
    direction: 'response',
    category: 'caching',
    description:
      'An opaque validator representing a specific version of a resource, used for conditional requests and cache revalidation.',
    syntax: 'ETag: "<tag>" | W/"<tag>"',
    example: 'ETag: "33a64df551"',
    spec: 'RFC 9110 §8.8.3',
  },
  {
    name: 'If-None-Match',
    direction: 'request',
    category: 'caching',
    description:
      "Makes a request conditional on the resource's ETag NOT matching; used for cache revalidation (304) or safe-creation checks.",
    syntax: 'If-None-Match: "<etag>" | *',
    example: 'If-None-Match: "33a64df551"',
    spec: 'RFC 9110 §13.1.2',
  },
  {
    name: 'Last-Modified',
    direction: 'response',
    category: 'caching',
    description:
      'The date the resource was last changed, used as a (weaker) validator for conditional requests.',
    syntax: 'Last-Modified: <HTTP-date>',
    example: 'Last-Modified: Mon, 14 Sep 2026 20:00:00 GMT',
    spec: 'RFC 9110 §8.8.2',
  },
  {
    name: 'Vary',
    direction: 'response',
    category: 'caching',
    description:
      'Lists request headers a cache must also match on to reuse a cached response (e.g. Accept-Encoding).',
    syntax: 'Vary: <header-name>, ... | *',
    example: 'Vary: Accept-Encoding, Origin',
    spec: 'RFC 9110 §12.5.5',
  },
  {
    name: 'Age',
    direction: 'response',
    category: 'caching',
    description:
      'The time in seconds a cached response has spent in a shared cache since it was generated.',
    syntax: 'Age: <seconds>',
    example: 'Age: 120',
    spec: 'RFC 9111 §5.1',
  },
  {
    name: 'Expires',
    direction: 'response',
    category: 'caching',
    description:
      'An absolute date after which the response is considered stale. Superseded by Cache-Control: max-age when both are present.',
    syntax: 'Expires: <HTTP-date>',
    example: 'Expires: Wed, 16 Sep 2026 08:00:00 GMT',
    spec: 'RFC 9111 §5.3',
  },

  // ---- CORS -------------------------------------------------------------
  {
    name: 'Origin',
    direction: 'request',
    category: 'cors',
    description:
      'Identifies the scheme+host+port a request originates from; sent on cross-origin (and some same-origin) fetches/XHR.',
    syntax: 'Origin: <scheme>://<host>[:<port>]',
    example: 'Origin: https://app.example.com',
    spec: 'RFC 6454 / Fetch §3.2',
  },
  {
    name: 'Access-Control-Allow-Origin',
    direction: 'response',
    category: 'cors',
    description:
      "Names the origin(s) allowed to read the response in a CORS request. `*` allows any origin (but cannot legally be combined with credentials).",
    syntax: 'Access-Control-Allow-Origin: <origin> | *',
    example: 'Access-Control-Allow-Origin: https://app.example.com',
    spec: 'Fetch §3.2.3',
  },
  {
    name: 'Access-Control-Allow-Credentials',
    direction: 'response',
    category: 'cors',
    description:
      'Tells the browser whether the response can be shared when the request was made with credentials (cookies, HTTP auth).',
    syntax: 'Access-Control-Allow-Credentials: true',
    example: 'Access-Control-Allow-Credentials: true',
    spec: 'Fetch §3.2.3',
  },
  {
    name: 'Access-Control-Allow-Methods',
    direction: 'response',
    category: 'cors',
    description:
      'Lists HTTP methods allowed when accessing the resource, returned in response to a preflight OPTIONS request.',
    syntax: 'Access-Control-Allow-Methods: <method>, ...',
    example: 'Access-Control-Allow-Methods: GET, POST, PUT, DELETE',
    spec: 'Fetch §3.2.6',
  },
  {
    name: 'Access-Control-Allow-Headers',
    direction: 'response',
    category: 'cors',
    description:
      'Lists request headers allowed in the actual request, returned in response to a preflight OPTIONS request.',
    syntax: 'Access-Control-Allow-Headers: <header>, ...',
    example: 'Access-Control-Allow-Headers: Content-Type, Authorization',
    spec: 'Fetch §3.2.6',
  },
  {
    name: 'Access-Control-Expose-Headers',
    direction: 'response',
    category: 'cors',
    description:
      'Lists response headers a browser script is allowed to read beyond the default safelisted set.',
    syntax: 'Access-Control-Expose-Headers: <header>, ... | *',
    example: 'Access-Control-Expose-Headers: X-Request-Id',
    spec: 'Fetch §3.2.5',
  },
  {
    name: 'Access-Control-Max-Age',
    direction: 'response',
    category: 'cors',
    description:
      'How long (in seconds) a preflight response can be cached before another preflight is required.',
    syntax: 'Access-Control-Max-Age: <seconds>',
    example: 'Access-Control-Max-Age: 600',
    spec: 'Fetch §3.2.7',
  },
  {
    name: 'Access-Control-Request-Method',
    direction: 'request',
    category: 'cors',
    description:
      'Sent by the browser in a preflight OPTIONS request to announce the method the actual request will use.',
    syntax: 'Access-Control-Request-Method: <method>',
    example: 'Access-Control-Request-Method: PUT',
    spec: 'Fetch §3.2.1',
  },
  {
    name: 'Access-Control-Request-Headers',
    direction: 'request',
    category: 'cors',
    description:
      'Sent by the browser in a preflight OPTIONS request to announce the headers the actual request will use.',
    syntax: 'Access-Control-Request-Headers: <header>, ...',
    example: 'Access-Control-Request-Headers: content-type, x-api-key',
    spec: 'Fetch §3.2.2',
  },
  {
    name: 'Timing-Allow-Origin',
    direction: 'response',
    category: 'cors',
    description:
      'Allows the given origin(s) to see detailed cross-origin timing info via the Resource Timing API.',
    syntax: 'Timing-Allow-Origin: <origin>, ... | *',
    example: 'Timing-Allow-Origin: *',
    spec: 'Resource Timing (W3C)',
  },

  // ---- Security -------------------------------------------------------------
  {
    name: 'Strict-Transport-Security',
    direction: 'response',
    category: 'security',
    description:
      'Forces browsers to only connect to this host over HTTPS for the given duration (HSTS).',
    syntax: 'Strict-Transport-Security: max-age=<seconds>[; includeSubDomains][; preload]',
    example: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
    spec: 'RFC 6797',
  },
  {
    name: 'Content-Security-Policy',
    direction: 'response',
    category: 'security',
    description:
      'Restricts which sources of scripts, styles, images, frames, etc. the page may load from, mitigating XSS and data-injection attacks.',
    syntax: 'Content-Security-Policy: <directive> <sources>; ...',
    example: "Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com",
    spec: 'CSP Level 3 (W3C)',
  },
  {
    name: 'Content-Security-Policy-Report-Only',
    direction: 'response',
    category: 'security',
    description:
      'Same directives as CSP but only reports violations (via the reporting API) instead of blocking — useful for testing a policy before enforcing it.',
    syntax: 'Content-Security-Policy-Report-Only: <policy>',
    example: "Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report",
    spec: 'CSP Level 3 (W3C)',
  },
  {
    name: 'X-Content-Type-Options',
    direction: 'response',
    category: 'security',
    description:
      'Tells browsers not to MIME-sniff the response away from the declared Content-Type, preventing certain content-sniffing attacks.',
    syntax: 'X-Content-Type-Options: nosniff',
    example: 'X-Content-Type-Options: nosniff',
    spec: 'Fetch / WHATWG (de facto standard)',
  },
  {
    name: 'X-Frame-Options',
    direction: 'response',
    category: 'security',
    description:
      "Controls whether the page can be embedded in a frame/iframe, preventing clickjacking. Superseded by CSP's `frame-ancestors` but still widely sent for older-browser support.",
    syntax: 'X-Frame-Options: DENY | SAMEORIGIN',
    example: 'X-Frame-Options: SAMEORIGIN',
    spec: 'RFC 7034 (informational)',
  },
  {
    name: 'Referrer-Policy',
    direction: 'response',
    category: 'security',
    description:
      'Controls how much referrer information (the Referer header) is sent with requests originating from the page.',
    syntax: 'Referrer-Policy: <policy>',
    example: 'Referrer-Policy: strict-origin-when-cross-origin',
    spec: 'Referrer Policy (W3C)',
  },
  {
    name: 'Permissions-Policy',
    direction: 'response',
    category: 'security',
    description:
      'Enables or restricts use of browser features/APIs (camera, geolocation, etc.) for the page and any embedded frames.',
    syntax: 'Permissions-Policy: <feature>=(<allowlist>), ...',
    example: 'Permissions-Policy: geolocation=(), camera=()',
    spec: 'Permissions Policy (W3C)',
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    direction: 'response',
    category: 'security',
    description:
      'Isolates the browsing context from cross-origin windows opened via window.open/target=_blank, mitigating cross-window attacks (e.g. Spectre).',
    syntax: 'Cross-Origin-Opener-Policy: unsafe-none | same-origin-allow-popups | same-origin',
    example: 'Cross-Origin-Opener-Policy: same-origin',
    spec: 'HTML Living Standard',
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    direction: 'response',
    category: 'security',
    description:
      'Restricts which origins can embed/load this resource (image, script, etc.), protecting against cross-origin leaks.',
    syntax: 'Cross-Origin-Resource-Policy: same-site | same-origin | cross-origin',
    example: 'Cross-Origin-Resource-Policy: same-origin',
    spec: 'Fetch (WHATWG)',
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    direction: 'response',
    category: 'security',
    description:
      'Requires that cross-origin resources embedded by this page explicitly opt in (via CORP or CORS), enabling cross-origin isolation.',
    syntax: 'Cross-Origin-Embedder-Policy: unsafe-none | require-corp | credentialless',
    example: 'Cross-Origin-Embedder-Policy: require-corp',
    spec: 'HTML Living Standard',
  },
  {
    name: 'Clear-Site-Data',
    direction: 'response',
    category: 'security',
    description:
      'Instructs the browser to clear cookies, storage, and/or cache associated with the origin, e.g. on logout.',
    syntax: 'Clear-Site-Data: "cache" | "cookies" | "storage" | "*"',
    example: 'Clear-Site-Data: "cookies", "storage"',
    spec: 'Clear Site Data (W3C)',
  },
  {
    name: 'X-Permitted-Cross-Domain-Policies',
    direction: 'response',
    category: 'security',
    description:
      'Controls whether Adobe Flash/PDF clients may load cross-domain policy files for this site. Legacy but still sent defensively.',
    syntax: 'X-Permitted-Cross-Domain-Policies: none | master-only | by-content-type | all',
    example: 'X-Permitted-Cross-Domain-Policies: none',
    spec: 'Adobe cross-domain policy spec (non-IETF)',
  },
  {
    name: 'X-DNS-Prefetch-Control',
    direction: 'response',
    category: 'security',
    description:
      'Controls whether the browser is allowed to proactively resolve DNS for links found on the page.',
    syntax: 'X-DNS-Prefetch-Control: on | off',
    example: 'X-DNS-Prefetch-Control: off',
    spec: 'De facto standard (not in an RFC)',
  },
  {
    name: 'X-Download-Options',
    direction: 'response',
    category: 'security',
    description:
      "Internet Explorer-only header that prevents a downloaded HTML file from executing in the site's context. Legacy, no effect on modern browsers.",
    syntax: 'X-Download-Options: noopen',
    example: 'X-Download-Options: noopen',
    spec: 'Non-standard (Microsoft)',
    deprecated: true,
  },
  {
    name: 'NEL',
    direction: 'response',
    category: 'security',
    description:
      'Configures Network Error Logging, asking the browser to report connectivity failures for this origin to a reporting endpoint.',
    syntax: 'NEL: {"report_to":"<group>","max_age":<seconds>}',
    example: 'NEL: {"report_to":"default","max_age":2592000}',
    spec: 'NEL (W3C)',
  },
  {
    name: 'Report-To',
    direction: 'response',
    category: 'security',
    description:
      'Configures named endpoint groups the browser can send reports to (CSP violations, NEL, deprecations, etc.).',
    syntax: 'Report-To: {"group":"<name>","endpoints":[{"url":"<url>"}],"max_age":<seconds>}',
    example: 'Report-To: {"group":"default","max_age":86400,"endpoints":[{"url":"https://example.com/reports"}]}',
    spec: 'Reporting API (W3C)',
  },

  // ---- Fetch metadata ---------------------------------------------------
  {
    name: 'Sec-Fetch-Site',
    direction: 'request',
    category: 'fetch-metadata',
    description:
      "Indicates the relationship between the request's origin and the target's origin (same-origin, same-site, cross-site, or none).",
    syntax: 'Sec-Fetch-Site: same-origin | same-site | cross-site | none',
    example: 'Sec-Fetch-Site: same-origin',
    spec: 'Fetch Metadata (W3C)',
  },
  {
    name: 'Sec-Fetch-Mode',
    direction: 'request',
    category: 'fetch-metadata',
    description:
      "Indicates the request's mode: cors, no-cors, navigate, same-origin, or websocket.",
    syntax: 'Sec-Fetch-Mode: cors | no-cors | navigate | same-origin | websocket',
    example: 'Sec-Fetch-Mode: cors',
    spec: 'Fetch Metadata (W3C)',
  },
  {
    name: 'Sec-Fetch-Dest',
    direction: 'request',
    category: 'fetch-metadata',
    description:
      "Indicates the request's destination — how the fetched resource will be used (document, image, script, style, etc.).",
    syntax: 'Sec-Fetch-Dest: document | image | script | style | ...',
    example: 'Sec-Fetch-Dest: image',
    spec: 'Fetch Metadata (W3C)',
  },
  {
    name: 'Sec-Fetch-User',
    direction: 'request',
    category: 'fetch-metadata',
    description:
      'Present (set to `?1`) only on requests generated by direct user activation (e.g. clicking a link), helping distinguish user-driven navigations.',
    syntax: 'Sec-Fetch-User: ?1',
    example: 'Sec-Fetch-User: ?1',
    spec: 'Fetch Metadata (W3C)',
  },

  // ---- Client hints -------------------------------------------------------
  {
    name: 'Sec-CH-UA',
    direction: 'request',
    category: 'client-hints',
    description:
      'Low-entropy brand and significant-version list for the browser, part of User-Agent Client Hints.',
    syntax: 'Sec-CH-UA: "<brand>";v="<version>", ...',
    example: 'Sec-CH-UA: "Chromium";v="129", "Not=A?Brand";v="8"',
    spec: 'User-Agent Client Hints (W3C)',
  },
  {
    name: 'Sec-CH-UA-Mobile',
    direction: 'request',
    category: 'client-hints',
    description: 'Indicates whether the browser is running on a mobile device.',
    syntax: 'Sec-CH-UA-Mobile: ?0 | ?1',
    example: 'Sec-CH-UA-Mobile: ?0',
    spec: 'User-Agent Client Hints (W3C)',
  },
  {
    name: 'Sec-CH-UA-Platform',
    direction: 'request',
    category: 'client-hints',
    description: 'The platform/OS the browser is running on.',
    syntax: 'Sec-CH-UA-Platform: "<platform>"',
    example: 'Sec-CH-UA-Platform: "Linux"',
    spec: 'User-Agent Client Hints (W3C)',
  },
  {
    name: 'Sec-CH-UA-Platform-Version',
    direction: 'request',
    category: 'client-hints',
    description:
      'The OS version, sent only when explicitly requested by the server via Accept-CH (a high-entropy hint).',
    syntax: 'Sec-CH-UA-Platform-Version: "<version>"',
    example: 'Sec-CH-UA-Platform-Version: "15.0.0"',
    spec: 'User-Agent Client Hints (W3C)',
  },
  {
    name: 'Accept-CH',
    direction: 'response',
    category: 'client-hints',
    description:
      'Lists the client hint headers the server wants the browser to send on subsequent requests to this origin.',
    syntax: 'Accept-CH: <hint>, ...',
    example: 'Accept-CH: Sec-CH-UA-Platform-Version, Sec-CH-UA-Full-Version-List',
    spec: 'Client Hints (W3C)',
  },
  {
    name: 'Sec-CH-Prefers-Color-Scheme',
    direction: 'request',
    category: 'client-hints',
    description:
      "Advertises the user's preferred color scheme (light/dark), sent only when opted in via Accept-CH.",
    syntax: 'Sec-CH-Prefers-Color-Scheme: light | dark',
    example: 'Sec-CH-Prefers-Color-Scheme: dark',
    spec: 'User Preference Media Features Client Hints (W3C)',
  },
  {
    name: 'Save-Data',
    direction: 'request',
    category: 'client-hints',
    description:
      'Signals that the user has requested a reduced-data-usage mode, so the server can serve lighter assets.',
    syntax: 'Save-Data: on',
    example: 'Save-Data: on',
    spec: 'Client Hints / Save-Data (W3C)',
  },
  {
    name: 'Device-Memory',
    direction: 'request',
    category: 'client-hints',
    description:
      'Approximate device RAM in gigabytes (rounded to a coarse value), sent only when opted in.',
    syntax: 'Device-Memory: <GB>',
    example: 'Device-Memory: 8',
    spec: 'Device Memory (W3C)',
  },
  {
    name: 'Width',
    direction: 'request',
    category: 'client-hints',
    description:
      "Legacy client hint giving the resource's intended display width in pixels; superseded by newer client-hint infrastructure.",
    syntax: 'Width: <pixels>',
    example: 'Width: 640',
    spec: 'Client Hints (legacy, superseded)',
    deprecated: true,
  },
  {
    name: 'DPR',
    direction: 'request',
    category: 'client-hints',
    description:
      'Legacy client hint giving the device pixel ratio; superseded by resolution info handled via CSS/JS or newer hints.',
    syntax: 'DPR: <ratio>',
    example: 'DPR: 2',
    spec: 'Client Hints (legacy, superseded)',
    deprecated: true,
  },
  {
    name: 'Viewport-Width',
    direction: 'request',
    category: 'client-hints',
    description:
      'Legacy client hint giving the layout viewport width in pixels; superseded, rarely honored by modern browsers.',
    syntax: 'Viewport-Width: <pixels>',
    example: 'Viewport-Width: 1280',
    spec: 'Client Hints (legacy, superseded)',
    deprecated: true,
  },

  // ---- Cookies ------------------------------------------------------------
  {
    name: 'Set-Cookie',
    direction: 'response',
    category: 'cookies',
    description:
      'Sends a cookie from the server to the client, with optional attributes controlling scope, lifetime, and security.',
    syntax:
      'Set-Cookie: <name>=<value>; [Expires=...; ][Max-Age=...; ][Domain=...; ][Path=...; ][Secure; ][HttpOnly; ][SameSite=Strict|Lax|None]',
    example: 'Set-Cookie: session=abc123; Path=/; HttpOnly; Secure; SameSite=Lax',
    spec: 'RFC 6265bis (draft) / RFC 6265',
  },
  {
    name: 'Cookie',
    direction: 'request',
    category: 'cookies',
    description: 'Sends previously stored cookies back to the server for the matching domain/path.',
    syntax: 'Cookie: <name>=<value>; <name2>=<value2>',
    example: 'Cookie: session=abc123; theme=dark',
    spec: 'RFC 6265 §5.4',
  },

  // ---- Deprecated / legacy --------------------------------------------------
  {
    name: 'Pragma',
    direction: 'both',
    category: 'deprecated',
    description:
      'Obsolete HTTP/1.0 caching directive. `Pragma: no-cache` on a request is still sometimes honored like Cache-Control: no-cache, but it has no defined meaning in responses.',
    syntax: 'Pragma: no-cache',
    example: 'Pragma: no-cache',
    spec: 'RFC 9111 §5.4 (historical)',
    deprecated: true,
  },
  {
    name: 'Expect-CT',
    direction: 'response',
    category: 'deprecated',
    description:
      'Told browsers to expect and enforce Certificate Transparency for the site. Deprecated and ignored by all major browsers now that CT is enforced natively.',
    syntax: 'Expect-CT: max-age=<seconds>[, enforce][, report-uri="<url>"]',
    example: 'Expect-CT: max-age=86400, enforce',
    spec: 'RFC 9163 (deprecated)',
    deprecated: true,
  },
  {
    name: 'X-XSS-Protection',
    direction: 'response',
    category: 'deprecated',
    description:
      "Used to enable/configure a browser's legacy reflected-XSS filter. Removed from all modern browsers; a strong Content-Security-Policy is the recommended replacement.",
    syntax: 'X-XSS-Protection: 0 | 1[; mode=block]',
    example: 'X-XSS-Protection: 0',
    spec: 'Non-standard (deprecated, no longer supported)',
    deprecated: true,
  },
  {
    name: 'Public-Key-Pins',
    direction: 'response',
    category: 'deprecated',
    description:
      'HTTP Public Key Pinning (HPKP): pinned a site to specific certificate public keys. Deprecated and removed from all major browsers due to a high risk of accidental site lockout.',
    syntax: 'Public-Key-Pins: pin-sha256="<hash>"; max-age=<seconds>',
    example: 'Public-Key-Pins: pin-sha256="base64=="; max-age=5184000',
    spec: 'RFC 7469 (deprecated)',
    deprecated: true,
  },
  {
    name: 'Public-Key-Pins-Report-Only',
    direction: 'response',
    category: 'deprecated',
    description:
      'Report-only variant of HPKP: reported pin violations without enforcing them. Deprecated along with Public-Key-Pins.',
    syntax: 'Public-Key-Pins-Report-Only: pin-sha256="<hash>"; max-age=<seconds>; report-uri="<url>"',
    example:
      'Public-Key-Pins-Report-Only: pin-sha256="base64=="; max-age=5184000; report-uri="https://example.com/hpkp"',
    spec: 'RFC 7469 (deprecated)',
    deprecated: true,
  },
];
