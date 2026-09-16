// Per-tool metadata. This is the ONE file (together with the `base` in
// vite.config.ts, index.html's <title>/meta tags, README.md, and everything
// under src/tool/) that changes when this template is copied to a sibling
// tool repo.

export type ToolCategory = 'JSON' | 'JWT' | 'SQL' | 'Docker' | 'Git' | 'Web';

export interface ToolConfig {
  /** Unique identifier used in embed postMessage payloads and URLs. */
  slug: string;
  /** Display name shown in the header. */
  name: string;
  /** Short description used for meta tags and listings. */
  description: string;
  /** One of the shared MMOALL tool categories. */
  category: ToolCategory;
  /** Keywords for search/SEO purposes. */
  keywords: string[];
}

export const toolConfig: ToolConfig = {
  slug: 'http-headers',
  name: 'HTTP Headers Reference & Analyzer',
  description:
    'Look up ~90 common HTTP headers, then paste raw response headers to parse them and run a security & caching audit — fast, free, and 100% client-side.',
  category: 'Web',
  keywords: [
    'http headers',
    'http headers reference',
    'security headers checker',
    'http header analyzer',
    'content security policy checker',
    'cors headers',
    'response headers parser',
    'security headers audit',
  ],
};
