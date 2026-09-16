// Pure, framework-free generators that turn a list of security headers into
// ready-to-paste config snippets for common servers/frameworks. Tool-specific.
// No dependency on any templating library.

export interface HeaderPair {
  name: string;
  value: string;
}

/** A reasonable default set of recommended security headers, used when the
 * user hasn't customized the selection from the analyzer's audit results. */
export const DEFAULT_RECOMMENDED_HEADERS: HeaderPair[] = [
  { name: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { name: 'Content-Security-Policy', value: "default-src 'self'" },
  { name: 'X-Content-Type-Options', value: 'nosniff' },
  { name: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { name: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=()' },
  { name: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { name: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

function escapeForDoubleQuotes(value: string): string {
  return value.replace(/"/g, '\\"');
}

function escapeForSingleQuotes(value: string): string {
  return value.replace(/'/g, "\\'");
}

/** nginx `add_header` directives, for server/location blocks. */
export function nginxSnippet(headers: HeaderPair[]): string {
  if (headers.length === 0) return '# No headers selected.';
  const lines = headers.map(
    (h) => `add_header ${h.name} "${escapeForDoubleQuotes(h.value)}" always;`,
  );
  return lines.join('\n');
}

/** Apache, for a vhost config or .htaccess (requires mod_headers). */
export function apacheSnippet(headers: HeaderPair[]): string {
  if (headers.length === 0) return '# No headers selected.';
  const lines = headers.map(
    (h) => `  Header always set ${h.name} "${escapeForDoubleQuotes(h.value)}"`,
  );
  return ['<IfModule mod_headers.c>', ...lines, '</IfModule>'].join('\n');
}

/** Plain Express (Node.js) middleware, no helmet or other dependency assumed. */
export function expressSnippet(headers: HeaderPair[]): string {
  if (headers.length === 0) return '// No headers selected.';
  const lines = headers.map(
    (h) => `  res.setHeader('${h.name}', '${escapeForSingleQuotes(h.value)}');`,
  );
  return [
    'app.use((req, res, next) => {',
    ...lines,
    '  next();',
    '});',
  ].join('\n');
}

/** Next.js, via next.config.js/ts `headers()`. */
export function nextjsSnippet(headers: HeaderPair[]): string {
  if (headers.length === 0) return '// No headers selected.';
  const entries = headers.map(
    (h) => `          { key: '${h.name}', value: '${escapeForSingleQuotes(h.value)}' },`,
  );
  return [
    '/** @type {import("next").NextConfig} */',
    'module.exports = {',
    '  async headers() {',
    '    return [',
    '      {',
    "        source: '/:path*',",
    '        headers: [',
    ...entries,
    '        ],',
    '      },',
    '    ];',
    '  },',
    '};',
  ].join('\n');
}

export type SnippetTarget = 'nginx' | 'apache' | 'express' | 'nextjs';

export const SNIPPET_TARGET_LABELS: Record<SnippetTarget, string> = {
  nginx: 'nginx',
  apache: 'Apache',
  express: 'Express (Node.js)',
  nextjs: 'Next.js',
};

export function generateSnippet(target: SnippetTarget, headers: HeaderPair[]): string {
  switch (target) {
    case 'nginx':
      return nginxSnippet(headers);
    case 'apache':
      return apacheSnippet(headers);
    case 'express':
      return expressSnippet(headers);
    case 'nextjs':
      return nextjsSnippet(headers);
    default:
      return '';
  }
}
