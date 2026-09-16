// Per-tool metadata. This is the ONE file (together with `src/tool/`,
// `index.html`'s fallback <title>, and this repo's README) that changes
// when this template is copied to a new tool repo.

// Imports from '@mmoall/tool-kit/config' (a plain-JS-backed subpath), not
// the main '@mmoall/tool-kit' barrel — this file is also reachable from
// vite.config.ts's config-load chain, which cannot load the main barrel's
// .ts source from inside node_modules. See '@mmoall/tool-kit/config's
// source comment for why.
import { defineToolConfig } from '@mmoall/tool-kit/config';

export const toolConfig = defineToolConfig({
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
});
