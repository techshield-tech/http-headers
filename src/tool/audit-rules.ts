// Pure, framework-free security & caching audit rules. Runs entirely against
// already-parsed headers in memory — no network access. Tool-specific.

import { getHeaderValue, getHeaderValues, hasHeader, type ParsedHeader } from './header-parser';

export type AuditStatus = 'pass' | 'warn' | 'fail';

export interface AuditResult {
  id: string;
  title: string;
  status: AuditStatus;
  /** Human-readable explanation of the finding, shown under the title. */
  detail: string;
}

// Strict-Transport-Security directives are semicolon-separated
// ("max-age=...; includeSubDomains").
function splitBySemicolon(value: string): string[] {
  return value
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part !== '');
}

// Cache-Control directives are comma-separated ("no-cache, max-age=0"),
// unlike HSTS. Getting this delimiter wrong would silently break parsing.
function splitByComma(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part !== '');
}

interface ParsedCookie {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
}

function parseSetCookie(value: string): ParsedCookie {
  const parts = value.split(';').map((p) => p.trim());
  const nameValue = parts[0] ?? '';
  const name = nameValue.split('=')[0]?.trim() || '(unnamed)';

  let secure = false;
  let httpOnly = false;
  let sameSite: string | null = null;

  for (const attr of parts.slice(1)) {
    const [rawKey, rawVal] = attr.split('=').map((s) => s.trim());
    const key = (rawKey ?? '').toLowerCase();
    if (key === 'secure') secure = true;
    else if (key === 'httponly') httpOnly = true;
    else if (key === 'samesite') sameSite = rawVal ?? null;
  }

  return { name, secure, httpOnly, sameSite };
}

const STRICT_REFERRER_POLICIES = new Set([
  'no-referrer',
  'no-referrer-when-downgrade',
  'same-origin',
  'strict-origin',
  'strict-origin-when-cross-origin',
]);

const INFO_LEAK_HEADER_NAMES = ['Server', 'X-Powered-By', 'X-AspNet-Version', 'X-AspNetMvc-Version'];

/** Matches a version-looking token, e.g. "1.25.3", "PHP/8.2.1", "nginx/1.25". */
const VERSION_TOKEN_RE = /\d+\.\d+(\.\d+)?/;

function auditHsts(headers: ParsedHeader[]): AuditResult {
  const value = getHeaderValue(headers, 'Strict-Transport-Security');
  if (value === null) {
    return {
      id: 'hsts',
      title: 'Strict-Transport-Security (HSTS)',
      status: 'fail',
      detail: 'Missing. Without HSTS, browsers may still connect over plain HTTP, exposing the first request to downgrade/MITM attacks.',
    };
  }

  const directives = splitBySemicolon(value);
  const maxAgeDirective = directives.find((d) => d.toLowerCase().startsWith('max-age='));
  const maxAge = maxAgeDirective ? Number(maxAgeDirective.split('=')[1]) : NaN;
  const includeSubDomains = directives.some((d) => d.toLowerCase() === 'includesubdomains');

  if (Number.isNaN(maxAge)) {
    return {
      id: 'hsts',
      title: 'Strict-Transport-Security (HSTS)',
      status: 'warn',
      detail: `Present but max-age could not be parsed: "${value}".`,
    };
  }

  if (maxAge < 31536000) {
    return {
      id: 'hsts',
      title: 'Strict-Transport-Security (HSTS)',
      status: 'warn',
      detail: `Present, but max-age=${maxAge} is below the recommended 1 year (31536000 seconds).`,
    };
  }

  if (!includeSubDomains) {
    return {
      id: 'hsts',
      title: 'Strict-Transport-Security (HSTS)',
      status: 'warn',
      detail: `max-age=${maxAge} is sufficient, but includeSubDomains is missing — subdomains are not protected.`,
    };
  }

  return {
    id: 'hsts',
    title: 'Strict-Transport-Security (HSTS)',
    status: 'pass',
    detail: `max-age=${maxAge} (≥ 1 year) with includeSubDomains.`,
  };
}

function auditCsp(headers: ParsedHeader[]): AuditResult {
  const value = getHeaderValue(headers, 'Content-Security-Policy');
  if (value === null) {
    return {
      id: 'csp',
      title: 'Content-Security-Policy',
      status: 'fail',
      detail: 'Missing. No CSP means the browser enforces no restriction on where scripts, styles, or frames can load from, leaving the page more exposed to XSS.',
    };
  }

  const issues: string[] = [];
  if (/unsafe-inline/i.test(value)) issues.push("'unsafe-inline' allows inline scripts/styles, weakening XSS protection");
  if (/unsafe-eval/i.test(value)) issues.push("'unsafe-eval' allows eval()-like code execution");
  // A bare "*" token as a directive value (e.g. "script-src *"), not a
  // subdomain wildcard like "https://*.example.com" which is more scoped.
  if (/(^|[\s;])\*(?=[\s;]|$)/.test(value)) {
    issues.push('a wildcard (*) source allows loading from any origin in at least one directive');
  }

  if (issues.length > 0) {
    return {
      id: 'csp',
      title: 'Content-Security-Policy',
      status: 'warn',
      detail: `Present, but has potentially risky directives: ${issues.join('; ')}.`,
    };
  }

  return {
    id: 'csp',
    title: 'Content-Security-Policy',
    status: 'pass',
    detail: "Present, with no 'unsafe-inline', 'unsafe-eval', or wildcard sources detected.",
  };
}

function auditXContentTypeOptions(headers: ParsedHeader[]): AuditResult {
  const value = getHeaderValue(headers, 'X-Content-Type-Options');
  if (value === null) {
    return {
      id: 'xcto',
      title: 'X-Content-Type-Options',
      status: 'fail',
      detail: 'Missing. Without "nosniff", browsers may MIME-sniff responses, which can enable certain content-sniffing attacks.',
    };
  }
  if (value.toLowerCase() !== 'nosniff') {
    return {
      id: 'xcto',
      title: 'X-Content-Type-Options',
      status: 'warn',
      detail: `Present but unexpected value "${value}" — the only defined value is "nosniff".`,
    };
  }
  return {
    id: 'xcto',
    title: 'X-Content-Type-Options',
    status: 'pass',
    detail: 'Set to "nosniff".',
  };
}

function auditClickjacking(headers: ParsedHeader[]): AuditResult {
  const csp = getHeaderValue(headers, 'Content-Security-Policy');
  const hasFrameAncestors = csp !== null && /frame-ancestors/i.test(csp);
  const xfo = getHeaderValue(headers, 'X-Frame-Options');

  if (hasFrameAncestors) {
    return {
      id: 'clickjacking',
      title: 'Clickjacking protection',
      status: 'pass',
      detail: "Content-Security-Policy includes a frame-ancestors directive.",
    };
  }
  if (xfo !== null) {
    return {
      id: 'clickjacking',
      title: 'Clickjacking protection',
      status: 'pass',
      detail: `X-Frame-Options: ${xfo}. Consider migrating to CSP frame-ancestors, which is more flexible and better supported going forward.`,
    };
  }
  return {
    id: 'clickjacking',
    title: 'Clickjacking protection',
    status: 'fail',
    detail: 'Neither CSP frame-ancestors nor X-Frame-Options is present. The page can be embedded in a frame on any site.',
  };
}

function auditReferrerPolicy(headers: ParsedHeader[]): AuditResult {
  const value = getHeaderValue(headers, 'Referrer-Policy');
  if (value === null) {
    return {
      id: 'referrer-policy',
      title: 'Referrer-Policy',
      status: 'warn',
      detail: 'Missing. Browsers fall back to their default (strict-origin-when-cross-origin in modern browsers), but setting it explicitly is recommended.',
    };
  }
  const firstPolicy = value.split(',')[0]?.trim().toLowerCase() ?? '';
  if (firstPolicy === 'unsafe-url') {
    return {
      id: 'referrer-policy',
      title: 'Referrer-Policy',
      status: 'fail',
      detail: '"unsafe-url" leaks the full URL (including paths/query strings) to every cross-origin destination, including over plain HTTP.',
    };
  }
  if (STRICT_REFERRER_POLICIES.has(firstPolicy)) {
    return {
      id: 'referrer-policy',
      title: 'Referrer-Policy',
      status: 'pass',
      detail: `Set to "${firstPolicy}", a reasonably strict policy.`,
    };
  }
  return {
    id: 'referrer-policy',
    title: 'Referrer-Policy',
    status: 'warn',
    detail: `Set to "${firstPolicy}", which is more permissive than recommended (e.g. strict-origin-when-cross-origin).`,
  };
}

function auditPermissionsPolicy(headers: ParsedHeader[]): AuditResult {
  const value = getHeaderValue(headers, 'Permissions-Policy');
  if (value === null) {
    return {
      id: 'permissions-policy',
      title: 'Permissions-Policy',
      status: 'warn',
      detail: 'Missing. Without it, powerful browser features (camera, geolocation, etc.) are not explicitly restricted for this page or embedded frames.',
    };
  }
  return {
    id: 'permissions-policy',
    title: 'Permissions-Policy',
    status: 'pass',
    detail: `Present: ${value}`,
  };
}

function auditCrossOriginIsolation(headers: ParsedHeader[]): AuditResult {
  const coop = getHeaderValue(headers, 'Cross-Origin-Opener-Policy');
  const corp = getHeaderValue(headers, 'Cross-Origin-Resource-Policy');

  if (coop !== null && corp !== null) {
    return {
      id: 'coop-corp',
      title: 'Cross-Origin-Opener-Policy / Cross-Origin-Resource-Policy',
      status: 'pass',
      detail: `COOP: ${coop}; CORP: ${corp}.`,
    };
  }
  if (coop !== null || corp !== null) {
    return {
      id: 'coop-corp',
      title: 'Cross-Origin-Opener-Policy / Cross-Origin-Resource-Policy',
      status: 'warn',
      detail: `Only one is present (COOP: ${coop ?? 'missing'}; CORP: ${corp ?? 'missing'}). Setting both gives stronger cross-origin isolation.`,
    };
  }
  return {
    id: 'coop-corp',
    title: 'Cross-Origin-Opener-Policy / Cross-Origin-Resource-Policy',
    status: 'warn',
    detail: 'Neither is present. These headers help isolate this page/resource from cross-origin windows and embedders.',
  };
}

function auditCookies(headers: ParsedHeader[]): AuditResult {
  const values = getHeaderValues(headers, 'Set-Cookie');
  if (values.length === 0) {
    return {
      id: 'cookies',
      title: 'Set-Cookie flags',
      status: 'pass',
      detail: 'No Set-Cookie headers present.',
    };
  }

  const cookies = values.map(parseSetCookie);
  const issues: string[] = [];
  for (const cookie of cookies) {
    const missing: string[] = [];
    if (!cookie.secure) missing.push('Secure');
    if (!cookie.httpOnly) missing.push('HttpOnly');
    if (!cookie.sameSite) missing.push('SameSite');
    if (missing.length > 0) {
      issues.push(`"${cookie.name}" is missing ${missing.join(', ')}`);
    }
  }

  if (issues.length === 0) {
    return {
      id: 'cookies',
      title: 'Set-Cookie flags',
      status: 'pass',
      detail: `All ${cookies.length} cookie(s) set Secure, HttpOnly, and SameSite.`,
    };
  }

  return {
    id: 'cookies',
    title: 'Set-Cookie flags',
    status: 'warn',
    detail: `${issues.length} of ${cookies.length} cookie(s) have missing flags: ${issues.join('; ')}.`,
  };
}

function auditCors(headers: ParsedHeader[]): AuditResult {
  const allowOrigin = getHeaderValue(headers, 'Access-Control-Allow-Origin');
  const allowCredentials = getHeaderValue(headers, 'Access-Control-Allow-Credentials');

  if (allowOrigin === null) {
    return {
      id: 'cors',
      title: 'CORS configuration',
      status: 'pass',
      detail: 'No Access-Control-Allow-Origin header present (not a CORS-enabled response, or headers were captured same-origin).',
    };
  }

  if (allowOrigin.trim() === '*' && allowCredentials?.trim().toLowerCase() === 'true') {
    return {
      id: 'cors',
      title: 'CORS configuration',
      status: 'fail',
      detail: 'Access-Control-Allow-Origin: * combined with Access-Control-Allow-Credentials: true. Browsers reject this combination, but some servers that reflect the request Origin instead of using "*" create the same effect — any site can read authenticated responses. Restrict Allow-Origin to specific trusted origins.',
    };
  }

  if (allowOrigin.trim() === '*') {
    return {
      id: 'cors',
      title: 'CORS configuration',
      status: 'warn',
      detail: 'Access-Control-Allow-Origin: * allows any origin to read this response. Fine for public, non-authenticated resources; risky otherwise.',
    };
  }

  return {
    id: 'cors',
    title: 'CORS configuration',
    status: 'pass',
    detail: `Access-Control-Allow-Origin is restricted to: ${allowOrigin}.`,
  };
}

function auditInfoLeak(headers: ParsedHeader[]): AuditResult {
  const leaks: string[] = [];
  for (const name of INFO_LEAK_HEADER_NAMES) {
    const value = getHeaderValue(headers, name);
    if (value !== null && value.trim() !== '') {
      const hasVersion = VERSION_TOKEN_RE.test(value);
      leaks.push(`${name}: ${value}${hasVersion ? ' (reveals a version number)' : ''}`);
    }
  }

  if (leaks.length === 0) {
    return {
      id: 'info-leak',
      title: 'Information leakage',
      status: 'pass',
      detail: 'No Server/X-Powered-By style headers revealing software or version info were found.',
    };
  }

  return {
    id: 'info-leak',
    title: 'Information leakage',
    status: 'warn',
    detail: `Found headers that disclose server software/versions, useful to an attacker for fingerprinting: ${leaks.join('; ')}.`,
  };
}

function auditCacheControl(headers: ParsedHeader[]): AuditResult {
  const value = getHeaderValue(headers, 'Cache-Control');
  const hasSetCookie = hasHeader(headers, 'Set-Cookie');
  const hasAuthorization = hasHeader(headers, 'Authorization');

  if (value === null) {
    if (hasSetCookie || hasAuthorization) {
      return {
        id: 'cache-control',
        title: 'Cache-Control sanity',
        status: 'warn',
        detail: 'No Cache-Control header, but the response carries cookies/credentials. Sensitive responses should generally send "Cache-Control: no-store" to avoid being cached.',
      };
    }
    return {
      id: 'cache-control',
      title: 'Cache-Control sanity',
      status: 'warn',
      detail: 'Missing. Without it, caching behavior is left to each cache\'s heuristics, which is unpredictable.',
    };
  }

  const directives = splitByComma(value).map((d) => d.toLowerCase());
  const hasNoStore = directives.includes('no-store');
  const hasPublic = directives.some((d) => d === 'public');
  const hasPrivate = directives.some((d) => d === 'private');
  const maxAgeDirective = directives.find((d) => d.startsWith('max-age='));

  const conflicts: string[] = [];
  if (hasNoStore && maxAgeDirective) conflicts.push(`no-store together with ${maxAgeDirective}`);
  if (hasPublic && hasPrivate) conflicts.push('both public and private');

  if (conflicts.length > 0) {
    return {
      id: 'cache-control',
      title: 'Cache-Control sanity',
      status: 'warn',
      detail: `Conflicting directives: ${conflicts.join('; ')}.`,
    };
  }

  if ((hasSetCookie || hasAuthorization) && !hasNoStore && hasPublic) {
    return {
      id: 'cache-control',
      title: 'Cache-Control sanity',
      status: 'warn',
      detail: `Response carries cookies/credentials but Cache-Control is "${value}" (public, no no-store) — shared caches may store sensitive data.`,
    };
  }

  return {
    id: 'cache-control',
    title: 'Cache-Control sanity',
    status: 'pass',
    detail: `Present: ${value}`,
  };
}

/** Runs the full security & caching audit against a parsed header list. */
export function runAudit(headers: ParsedHeader[]): AuditResult[] {
  return [
    auditHsts(headers),
    auditCsp(headers),
    auditXContentTypeOptions(headers),
    auditClickjacking(headers),
    auditReferrerPolicy(headers),
    auditPermissionsPolicy(headers),
    auditCrossOriginIsolation(headers),
    auditCookies(headers),
    auditCors(headers),
    auditInfoLeak(headers),
    auditCacheControl(headers),
  ];
}
