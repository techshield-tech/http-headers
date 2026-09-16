// Pure, framework-free parser for raw HTTP response headers pasted by the
// user (e.g. the output of `curl -I`). Tool-specific. No network access —
// this only ever operates on text already in the browser.

export interface ParsedHeader {
  /** Header name exactly as it appeared in the input (case preserved). */
  name: string;
  value: string;
}

export interface ParsedHeaders {
  /** The leading status line (e.g. "HTTP/1.1 200 OK"), if present. */
  statusLine: string | null;
  /** All headers in the order they appeared. Duplicate names are kept as separate entries. */
  headers: ParsedHeader[];
}

const STATUS_LINE_RE = /^HTTP\/\d(?:\.\d)?\s+\d{3}(\s|$)/i;

/**
 * Parses raw pasted HTTP response headers.
 *
 * Handles:
 *  - An optional leading status line ("HTTP/1.1 200 OK").
 *  - Obsolete line-folding: a continuation line starting with a space or tab
 *    is appended to the previous header's value.
 *  - Duplicate header names (e.g. multiple Set-Cookie lines) — each is kept
 *    as its own entry rather than merged.
 *  - Case-insensitive header names (the original casing is preserved on
 *    each entry; use `getHeaderValue(s)` for case-insensitive lookups).
 *  - CRLF or LF line endings, and blank/malformed lines are simply skipped.
 */
export function parseHeaders(raw: string): ParsedHeaders {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let statusLine: string | null = null;
  const headers: ParsedHeader[] = [];

  for (const rawLine of lines) {
    if (rawLine.trim() === '') {
      continue;
    }

    // Obsolete line folding: a line starting with whitespace continues the
    // previous header's value.
    if (/^[ \t]/.test(rawLine) && headers.length > 0) {
      const last = headers[headers.length - 1];
      last.value = `${last.value} ${rawLine.trim()}`.trim();
      continue;
    }

    if (statusLine === null && headers.length === 0 && STATUS_LINE_RE.test(rawLine.trim())) {
      statusLine = rawLine.trim();
      continue;
    }

    const colonIndex = rawLine.indexOf(':');
    if (colonIndex <= 0) {
      // No colon (or colon is the first character) — not a valid header
      // line and not a status line either. Skip it.
      continue;
    }

    const name = rawLine.slice(0, colonIndex).trim();
    const value = rawLine.slice(colonIndex + 1).trim();
    if (name === '') {
      continue;
    }
    headers.push({ name, value });
  }

  return { statusLine, headers };
}

/** Case-insensitive lookup of every value for a given header name, in order. */
export function getHeaderValues(headers: ParsedHeader[], name: string): string[] {
  const target = name.toLowerCase();
  return headers.filter((h) => h.name.toLowerCase() === target).map((h) => h.value);
}

/** Case-insensitive lookup of the first value for a given header name, or null. */
export function getHeaderValue(headers: ParsedHeader[], name: string): string | null {
  const target = name.toLowerCase();
  const found = headers.find((h) => h.name.toLowerCase() === target);
  return found ? found.value : null;
}

/** Case-insensitive check for whether a header is present at all. */
export function hasHeader(headers: ParsedHeader[], name: string): boolean {
  const target = name.toLowerCase();
  return headers.some((h) => h.name.toLowerCase() === target);
}
