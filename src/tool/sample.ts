// Representative sample raw response headers for the Analyzer tab's "Load
// sample" action. Deliberately exercises most audit rules (weak HSTS,
// unsafe-inline CSP, missing Permissions-Policy/COOP/CORP, cookies missing
// flags, a CORS misconfiguration, and version-revealing headers) plus
// obsolete line folding on the Content-Security-Policy value. Tool-specific.

export const SAMPLE_RESPONSE_HEADERS = `HTTP/1.1 200 OK
Date: Tue, 15 Sep 2026 08:00:00 GMT
Server: nginx/1.25.3
Content-Type: text/html; charset=UTF-8
Content-Length: 5382
Connection: keep-alive
Cache-Control: public, max-age=3600
ETag: "33a64df551"
Vary: Accept-Encoding
Strict-Transport-Security: max-age=15768000
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.example.com
Referrer-Policy: no-referrer-when-downgrade
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Set-Cookie: session=abc123; Path=/; HttpOnly
Set-Cookie: theme=dark; Path=/; Secure; SameSite=Lax
X-Powered-By: Express/4.18.2
`;
