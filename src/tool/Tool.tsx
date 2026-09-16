import { useMemo, useState, type ReactNode } from 'react';
import { Button, CopyButton, Panel, Select, TextArea, Toolbar } from '@mmoall/tool-kit';
import {
  HEADER_CATEGORIES,
  HEADER_CATEGORY_LABELS,
  HEADER_DIRECTION_LABELS,
  HEADERS,
  type HeaderCategory,
  type HeaderDefinition,
} from './headers-data';
import { parseHeaders, type ParsedHeader } from './header-parser';
import { runAudit, type AuditResult, type AuditStatus } from './audit-rules';
import {
  DEFAULT_RECOMMENDED_HEADERS,
  SNIPPET_TARGET_LABELS,
  generateSnippet,
  type HeaderPair,
  type SnippetTarget,
} from './security-snippets';
import { SAMPLE_RESPONSE_HEADERS } from './sample';

type TabId = 'reference' | 'analyzer';

const TABS: { id: TabId; label: string }[] = [
  { id: 'reference', label: 'Reference' },
  { id: 'analyzer', label: 'Analyzer' },
];

const inputClassName =
  'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]';

function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'danger' }) {
  const toneClassName =
    tone === 'danger'
      ? 'border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
      : 'border-[var(--color-border)] text-[var(--color-muted)]';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${toneClassName}`}
    >
      {children}
    </span>
  );
}

const STATUS_STYLES: Record<AuditStatus, { label: string; className: string }> = {
  pass: {
    label: 'PASS',
    className: 'border-[var(--color-accent)] text-[var(--color-accent)]',
  },
  warn: {
    label: 'WARN',
    className: 'border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg)]',
  },
  fail: {
    label: 'FAIL',
    className: 'border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  },
};

function StatusBadge({ status }: { status: AuditStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

export function Tool() {
  const [tab, setTab] = useState<TabId>('reference');

  return (
    <div className="flex flex-col gap-4">
      <Toolbar>
        {TABS.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'primary' : 'ghost'}
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </Toolbar>

      {tab === 'reference' ? <ReferenceTab /> : <AnalyzerTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reference tab
// ---------------------------------------------------------------------------

const CATEGORY_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All categories' },
  ...HEADER_CATEGORIES.map((category) => ({ value: category, label: HEADER_CATEGORY_LABELS[category] })),
];

function matchesSearch(header: HeaderDefinition, query: string): boolean {
  if (query === '') return true;
  const haystack = `${header.name} ${header.description}`.toLowerCase();
  return haystack.includes(query);
}

function ReferenceTab() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | HeaderCategory>('all');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return HEADERS.filter(
      (header) => (category === 'all' || header.category === category) && matchesSearch(header, query),
    );
  }, [search, category]);

  return (
    <div className="flex flex-col gap-4">
      <Toolbar>
        <input
          type="search"
          aria-label="Search headers"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or description…"
          className={`${inputClassName} max-w-xs flex-1`}
        />
        <Select
          aria-label="Filter by category"
          value={category}
          onChange={(event) => setCategory(event.target.value as 'all' | HeaderCategory)}
          options={CATEGORY_FILTER_OPTIONS}
        />
        <span className="text-xs text-[var(--color-muted)]">
          {filtered.length} of {HEADERS.length} headers
        </span>
      </Toolbar>

      <Panel>
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--color-muted)]">No headers match your filters.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {filtered.map((header) => (
              <div key={header.name} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="font-mono text-sm font-semibold text-[var(--color-fg)]">{header.name}</code>
                  <Chip>{HEADER_DIRECTION_LABELS[header.direction]}</Chip>
                  <Chip>{HEADER_CATEGORY_LABELS[header.category]}</Chip>
                  {header.deprecated && <Chip tone="danger">Deprecated</Chip>}
                </div>
                <p className="text-sm text-[var(--color-fg)]">{header.description}</p>
                <dl className="grid grid-cols-1 gap-x-3 gap-y-1 text-xs sm:grid-cols-[5rem_1fr]">
                  <dt className="font-medium text-[var(--color-muted)]">Syntax</dt>
                  <dd className="break-all font-mono text-[var(--color-fg)]">{header.syntax}</dd>
                  <dt className="font-medium text-[var(--color-muted)]">Example</dt>
                  <dd className="break-all font-mono text-[var(--color-fg)]">{header.example}</dd>
                  <dt className="font-medium text-[var(--color-muted)]">Spec</dt>
                  <dd className="text-[var(--color-muted)]">{header.spec}</dd>
                </dl>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analyzer tab
// ---------------------------------------------------------------------------

const SNIPPET_TARGETS: SnippetTarget[] = ['nginx', 'apache', 'express', 'nextjs'];

function auditSummary(results: AuditResult[]): { pass: number; warn: number; fail: number } {
  return {
    pass: results.filter((r) => r.status === 'pass').length,
    warn: results.filter((r) => r.status === 'warn').length,
    fail: results.filter((r) => r.status === 'fail').length,
  };
}

function AnalyzerTab() {
  const [rawInput, setRawInput] = useState('');
  const [selectedHeaderNames, setSelectedHeaderNames] = useState<Set<string>>(
    () => new Set(DEFAULT_RECOMMENDED_HEADERS.map((h) => h.name)),
  );
  const [snippetTarget, setSnippetTarget] = useState<SnippetTarget>('nginx');

  const parsed = useMemo(() => parseHeaders(rawInput), [rawInput]);
  const auditResults = useMemo(() => runAudit(parsed.headers), [parsed.headers]);
  const summary = useMemo(() => auditSummary(auditResults), [auditResults]);

  const selectedHeaders: HeaderPair[] = useMemo(
    () => DEFAULT_RECOMMENDED_HEADERS.filter((h) => selectedHeaderNames.has(h.name)),
    [selectedHeaderNames],
  );
  const snippet = useMemo(
    () => generateSnippet(snippetTarget, selectedHeaders),
    [snippetTarget, selectedHeaders],
  );

  const toggleHeader = (name: string) => {
    setSelectedHeaderNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Toolbar>
        <Button variant="ghost" onClick={() => setRawInput(SAMPLE_RESPONSE_HEADERS)}>
          Load sample
        </Button>
        <Button variant="ghost" onClick={() => setRawInput('')}>
          Clear
        </Button>
      </Toolbar>

      <Panel title="Paste response headers">
        <TextArea
          aria-label="Raw HTTP response headers"
          value={rawInput}
          onChange={(event) => setRawInput(event.target.value)}
          placeholder={'Paste the output of `curl -I <url>` here…\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n...'}
          className="min-h-[180px]"
        />
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Parsing and the audit below run entirely in your browser — nothing is sent to a server. This also
          sidesteps the CORS restrictions that would otherwise block reading another site's response headers
          directly from a browser page.
        </p>
      </Panel>

      {parsed.headers.length > 0 && (
        <>
          <Panel
            title="Parsed headers"
            actions={
              <span className="text-xs text-[var(--color-muted)]">{parsed.headers.length} headers</span>
            }
          >
            {parsed.statusLine && (
              <p className="mb-2 font-mono text-sm text-[var(--color-fg)]">{parsed.statusLine}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                    <th className="py-1.5 pr-3 font-medium">Name</th>
                    <th className="py-1.5 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.headers.map((header: ParsedHeader, index: number) => (
                    <tr key={`${header.name}-${index}`} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="whitespace-nowrap py-1.5 pr-3 align-top font-mono text-[var(--color-fg)]">
                        {header.name}
                      </td>
                      <td className="break-all py-1.5 align-top font-mono text-[var(--color-fg)]">
                        {header.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            title="Security & caching audit"
            actions={
              <span className="text-xs text-[var(--color-muted)]">
                {summary.pass} pass · {summary.warn} warn · {summary.fail} fail
              </span>
            }
          >
            <div className="flex flex-col divide-y divide-[var(--color-border)]">
              {auditResults.map((result) => (
                <div key={result.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-3">
                  <div className="sm:w-24 sm:shrink-0">
                    <StatusBadge status={result.status} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-fg)]">{result.title}</p>
                    <p className="text-sm text-[var(--color-muted)]">{result.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      <Panel title="Build security headers">
        <p className="mb-3 text-sm text-[var(--color-muted)]">
          Pick which recommended security headers to include, then copy a ready-to-paste snippet for your
          server or framework.
        </p>

        <div className="mb-3 flex flex-col gap-1.5">
          {DEFAULT_RECOMMENDED_HEADERS.map((header) => (
            <label key={header.name} className="flex items-start gap-2 text-sm text-[var(--color-fg)]">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={selectedHeaderNames.has(header.name)}
                onChange={() => toggleHeader(header.name)}
              />
              <span>
                <code className="font-mono font-medium">{header.name}</code>
                <span className="text-[var(--color-muted)]">: {header.value}</span>
              </span>
            </label>
          ))}
        </div>

        <Toolbar className="mb-2">
          <Select
            aria-label="Target server/framework"
            value={snippetTarget}
            onChange={(event) => setSnippetTarget(event.target.value as SnippetTarget)}
            options={SNIPPET_TARGETS.map((target) => ({ value: target, label: SNIPPET_TARGET_LABELS[target] }))}
          />
          <CopyButton getText={() => snippet} />
        </Toolbar>

        <TextArea aria-label="Generated snippet" value={snippet} readOnly className="min-h-[160px]" />
      </Panel>
    </div>
  );
}
