/**
 * TableWidget — pre-generated data-table widget (Archetype B).
 *
 * The universal, axis-less view: any list of records as sortable, searchable
 * rows with typed cells. The sister of CalendarWidget/ResourceTimeline/
 * KanbanWidget/MapWidget — a calendar orders a TIME axis, a kanban a CATEGORY
 * axis, a map SPACE; a table needs NO axis and works for every entity. It is
 * the default view when the data has no calendrical/categorical/spatial shape
 * (contacts, inventory, survey answers, invoices …). Compose; never reimplement.
 *
 * @version 1.3.4
 * @since 2026-07-01  (1.3.4: RELEASE POLISH — TableError/TableEmpty defaults
 *                     follow a `locale` prop (no more hard-wired German);
 *                     filter popovers close on Escape and return focus to
 *                     their trigger; TableSkeleton mirrors the real anatomy
 *                     (toolbar bones, header row, gutter-aligned cells with a
 *                     deterministic width pattern, footer band).
 *                     1.3.3: PAGINATION IS A DEFAULT, NOT A DECISION —
 *                     above 25 rows the table paginates itself; `pagination`
 *                     tunes the size, `false` opts out. A live build forgot
 *                     the prop and rendered every row — reliability defaults
 *                     never depend on the agent remembering.
 *                     1.3.2: THE CHOOSER KEEPS ITS WORD — re-pinning a shed
 *                     column ADDS it (union over the auto plan; it never evicts
 *                     another column — the table widens and scrolls instead).
 *                     Pins are deliberately EPHEMERAL (a look-up affordance,
 *                     not per-device configuration): permanent visibility is a
 *                     dashboard decision via `priority: 100`.
 *                     1.3.1: PIXEL TRUTH — table-layout:fixed with a colgroup
 *                     computed from the shedding budget's own width weights, so
 *                     the table can never overflow its container into an
 *                     invisible scroll zone again (v1.3 measured 81px over);
 *                     ONE toolbar row: search + faceted filter triggers +
 *                     consumer slots together (the shadcn reference), no
 *                     stacked bands; the default group header now shows the
 *                     PER-GROUP totals of aggregated columns automatically —
 *                     renderGroupHeader is rarely needed; column chooser strip
 *                     restyled (dashed outline, quieter).
 *                     1.3.0: UX HARDENING after the first live review, patterns
 *                     validated against Bryntum/DataTables/AG Grid/shadcn:
 *                     FACETED FILTERS — the filter band is now the shadcn-
 *                     DataTable toolbar (dashed trigger per column, popover with
 *                     counted checkbox options / labelled from–to ranges, active
 *                     values as badges in the trigger, global reset; narrow
 *                     containers collapse everything behind ONE "Filter (n)"
 *                     button). Set filters are MULTI-select. The +N badge is now
 *                     a clickable COLUMN CHOOSER (re-pin shed columns as chips).
 *                     'title'-only cardRole no longer empties the mobile card
 *                     body. Aggregated columns resist shedding (+25 priority)
 *                     and a shed column's total survives as a labelled summary
 *                     line; the footer row carries a "Gesamt" label. email ranks
 *                     with text in shedding priority; min-widths trimmed.
 *                     1.2.0: THE COMMON TIER — multi-row selection (`selectable`,
 *                     `isRowSelectable`, controlled `selectedIds`/`onSelectionChange`;
 *                     the widget owns ONLY selection state — bulk UI composes via
 *                     `toolbarEnd`), per-row `actions` (icon buttons, always visible
 *                     on coarse pointers), `density` presets, client-side
 *                     `pagination`, CSV `exportable` (current filtered+sorted view,
 *                     zero deps), typed per-column filters (`filterable`, kind
 *                     inferred from `format`: contains/range/set), flat `groupBy`
 *                     with collapsible headers (+`renderGroupHeader`), aggregate
 *                     footer (`column.aggregate` + `renderFooter`), and the Tier-1
 *                     hatches `renderCell` (column-scoped wins over widget-wide;
 *                     ctx carries `selected` + `stopRowClick`) and `renderHeader`
 *                     (widget keeps sort-click + ARIA). Built-in strings now follow
 *                     `locale`. Row clicks auto-suppress on interactive elements
 *                     (button/a/input/select/[role=checkbox]) — an interactive cell
 *                     never double-fires the row. NOT in this release (deliberate):
 *                     `pinned`/`resizable` (collide with responsive shedding —
 *                     revisit with a horizontal-scroll story), inline edit/reorder/
 *                     renderRow/renderRowDetail/renderFilter/renderToolbar (v2).
 *                     1.1.0: RESPONSIVE COLUMNS — between 480px and full width the
 *                     table sheds its lowest-priority columns (by `format`, or an
 *                     explicit `priority`) so the important ones fit without
 *                     horizontal scroll; a `+N` badge signals the shed columns and
 *                     their data stays reachable via the row-click overlay + search
 *                     + sort. Zero-config; `priority`/`responsive:'keep'` pin a
 *                     column, `responsiveColumns={false}` opts out.
 *                     1.0.0: first release — typed rows (`row.data` + a column
 *                     `accessor`, tsc-checked like <RecordField value=…/>), the
 *                     SHARED RecordView format enum (+ number/multipill/geo/file),
 *                     single-key sort with a raw-value comparator, global
 *                     search, click → RecordOverlay, tone via `toneForRow` or
 *                     `row.tone`, and a stacked-card layout under 480px CONTAINER
 *                     width.)
 *
 * ─── HARD RULES (read first) ───────────────────────────────────────────
 *  1. A clicked row MUST open a <RecordOverlay> (from RecordView) — the table
 *     owns NO detail layer. Wire `onRowClick`; never render your own modal.
 *  2. Never edit this file (nor ./primitives.ts — the family's shared
 *     mechanics); never import CalendarWidget/ResourceTimeline/KanbanWidget/
 *     MapWidget. A missing capability is reached by config today and by a slot
 *     later — never fork, never leave the build red. // TODO(widget-gap)
 *  3. Data-agnostic: the widget NEVER learns a Living-Apps field name. The
 *     consumer passes its REAL typed record as `row.data` and each column reads
 *     its value via `accessor(row)` (tsc-checked). `column.key` is an OPAQUE
 *     string (DOM key + sort/filter/group state), NOT a field name. tone comes
 *     from `toneForRow` or `row.tone`, never a magic data field.
 *  4. Sort/search/filter/aggregate/export read the RAW value from `accessor` —
 *     never the formatted string and never rendered JSX. A currency column sorts
 *     numerically though it renders "1.234,00 €"; a `renderCell` override changes
 *     ONLY the pixels, never the sortable value. `format` decides rendering only.
 *  5. Selection is STATE-only: the widget renders checkboxes and owns the Set —
 *     every bulk button/bar composes via `toolbarEnd` (or lives outside). The
 *     widget never learns what "delete selected" means.
 */
import { useMemo, useRef, useState, type ReactNode, type ComponentType } from 'react';
import { IconSearch, IconArrowUp, IconArrowDown, IconArrowsSort, IconAlertCircle, IconRefresh, IconInbox, IconFile, IconColumns, IconDownload, IconFilter, IconCirclePlus, IconX, IconChevronDown, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/formatters';
import { TONE_ACCENT, useCoarsePointer, useNarrowContainer } from './primitives';
import { type RecordFieldFormat } from './RecordView';

// A consumer building its own surface on these types re-uses the family's
// write-callback result without ever importing ./primitives (HARD RULE 2).
export type { WriteResult } from './primitives';

// Closed tone enum — exported as a const array so consumers reference values
// instead of typing string literals (the family's KANBAN_TONES pattern). Equals
// WidgetTone from primitives.
export const TABLE_TONES = ['default', 'primary', 'success', 'warning', 'destructive'] as const;
export type TableTone = (typeof TABLE_TONES)[number];

// THE one formatting vocabulary. `RecordFieldFormat` (the 9 values) is imported
// straight from RecordView — a SINGLE source of truth, not a parallel copy — and
// extended with the LA-only cases field_renderers.py already enumerates. A
// consumer building a custom surface re-uses this exported type.
export type TableCellFormat = RecordFieldFormat | 'number' | 'multipill' | 'geo' | 'file';

export type TableDensity = 'compact' | 'standard' | 'comfortable';
export type TableFilterKind = 'contains' | 'range' | 'set';

// Lookup/applookup cells share the exact blue pill used by RecordView /
// EntityPage / AdminPage — one visual truth.
const BLUE_PILL = 'inline-flex items-center bg-secondary border border-[#bfdbfe] text-[#2563eb] rounded-[10px] px-2 py-1 text-sm font-medium';

// Built-in UI strings follow the `locale` prop — the same switch the +N tooltip
// and number/sort formatting already use. Consumer-facing text (labels, empty
// states, error titles) stays a prop.
const UI = {
  de: {
    search: 'Suchen …', noResults: 'Keine Treffer', exportCsv: 'CSV',
    selectAll: 'Alle auswählen', selectRow: 'Zeile auswählen',
    filters: 'Filter', clearFilters: 'Zurücksetzen', all: 'Alle',
    columns: 'Spalten', total: 'Gesamt',
    yes: 'Ja', no: 'Nein', from: 'von', to: 'bis',
    prevPage: 'Vorherige Seite', nextPage: 'Nächste Seite',
    selected: (n: number) => `${n} ausgewählt`,
    errorTitle: 'Tabelle konnte nicht geladen werden', retry: 'Erneut versuchen',
    emptyTitle: 'Keine Einträge', file: 'Datei',
    page: (p: number, n: number) => `Seite ${p} von ${n}`,
    columnsHidden: (n: number) => `${n} Spalten ausgeblendet — Zeile öffnen für Details`,
  },
  en: {
    search: 'Search …', noResults: 'No matches', exportCsv: 'CSV',
    selectAll: 'Select all', selectRow: 'Select row',
    filters: 'Filters', clearFilters: 'Clear', all: 'All',
    columns: 'Columns', total: 'Total',
    yes: 'Yes', no: 'No', from: 'from', to: 'to',
    prevPage: 'Previous page', nextPage: 'Next page',
    selected: (n: number) => `${n} selected`,
    errorTitle: 'Table failed to load', retry: 'Try again',
    emptyTitle: 'No entries', file: 'File',
    page: (p: number, n: number) => `Page ${p} of ${n}`,
    columnsHidden: (n: number) => `${n} columns hidden — open a row for details`,
  },
} as const;

/** A row — LEAN and TYPED, like KanbanCard but carrying the consumer's real
 *  record as `data`. `id` is the family template `${entity}:${recordId}`, read
 *  back in callbacks with `id.split(':')[1]`. Columns read their value via
 *  `accessor(row)` so tsc checks the field access. `tone` may live on the row
 *  (KanbanCard pattern); `toneForRow` overrides it. */
export type TableRow<T = unknown> = {
  id: string;
  data: T;
  tone?: TableTone;
};

/** A per-row action — icon + label + onClick fused (the Retool lesson: the
 *  column type IS the slot). Rendered as a trailing icon-button cell: hover-
 *  revealed on fine pointers, ALWAYS visible on coarse (touch) pointers. */
export type TableRowAction<T = unknown> = {
  icon: ComponentType<{ size?: number | string; stroke?: number | string; className?: string }>;
  label: string;                                   // aria-label + tooltip
  onClick: (row: TableRow<T>) => void;
  tone?: TableTone;                                // e.g. 'destructive' for delete
  hidden?: (row: TableRow<T>) => boolean;
};

export type TableColumn<T = unknown> = {
  /** IDENTITY key: DOM key + sort/filter/group state. NOT the value getter (that
   *  is `accessor`) and NOT necessarily a field name — a string the consumer picks. */
  key: string;
  label: ReactNode;
  /** Reads the raw value from the typed `row.data`. Used for rendering (via
   *  `format`), sort, filter AND search. Default: `(row) => (row.data as any)[key]`. */
  accessor?: (row: TableRow<T>) => unknown;
  /** Rendering only — defaults to 'text'. Never affects the sortable raw value. */
  format?: TableCellFormat;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  className?: string;
  /** Default true — EXCEPT 'geo'/'file' (no scalar order on the object value). */
  sortable?: boolean;
  sortComparator?: (a: TableRow<T>, b: TableRow<T>) => number;
  /** Opt-in per-column filter control in the filter band. The control KIND is
   *  inferred from `format` (pill/multipill/bool → 'set', number/currency/date/
   *  datetime → 'range', else 'contains'); `filterKind` overrides. Filters read
   *  the RAW `accessor` value, like sort/search. */
  filterable?: boolean;
  filterKind?: TableFilterKind;
  /** In the global search. Default true — EXCEPT 'geo'/'file'. */
  searchable?: boolean;
  hidden?: boolean;
  /** Sum/avg/count over the CURRENT filtered view, rendered in a footer row —
   *  or a function returning custom ReactNode. sum/avg format via the column's
   *  `format` (currency → "1.234,00 €"). */
  aggregate?: 'sum' | 'avg' | 'count' | ((rows: TableRow<T>[]) => ReactNode);
  /** Narrow-container (card) role: 'title' = card heading, 'subtitle' = second
   *  line, 'body' = label/value pair, omitted = hidden on the card. If NO column
   *  is marked, the first text column becomes the title and the rest the body. */
  cardRole?: 'title' | 'subtitle' | 'body';
  /** Responsive shedding (480px→full): higher = kept longer under width pressure.
   *  Default derives from `format` (currency/number/text high, longtext/multipill/
   *  geo/file low), so the common case needs NONE. Bump (e.g. `priority: 100`) to
   *  pin an important column. The identity (title) column is never shed. */
  priority?: number;
  /** Assumed rendered width (px) the shedding budget reserves for this column —
   *  NEVER measured per cell. Defaults per `format`; an explicit numeric `width`
   *  overrides it. */
  minWidth?: number;
  /** `'keep'` pins the column visible at every width (reads as intent; = priority
   *  Infinity). Default `'auto'` lets it shed when space is tight. */
  responsive?: 'keep' | 'auto';
  /** Tier-1 escape hatch: arbitrary React for THIS column's cells. Overrides
   *  `format` AND the widget-wide `renderCell` (column-scoped wins). Receives the
   *  RAW accessor value — sort/filter/search still read that value, never the JSX.
   *  `ctx.stopRowClick()` suppresses the row's onRowClick for this click (clicks
   *  on button/a/input/select/[role=checkbox] are auto-suppressed anyway). */
  renderCell?: (value: unknown, row: TableRow<T>,
                ctx: { selected: boolean; stopRowClick: () => void }) => ReactNode;
  /** Tier-1 escape hatch: custom header content. The widget keeps the sort
   *  click-target, direction icon and aria-sort around whatever this returns. */
  renderHeader?: (column: TableColumn<T>) => ReactNode;
};

export type TableWidgetProps<T = unknown> = {
  columns: TableColumn<T>[];
  rows: TableRow<T>[];
  locale?: 'de' | 'en';
  /** Row-height preset — discrete, never auto-measured. Default 'standard';
   *  'comfortable' gives longtext/multipill/file room, 'compact' fits more rows. */
  density?: TableDensity;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  className?: string;
  /** Family default: click a row → open a <RecordOverlay>. */
  onRowClick?: (row: TableRow<T>) => void;
  /** Tone by closure; overrides `row.tone`. */
  toneForRow?: (row: TableRow<T>) => TableTone | undefined;
  /** Checkbox column + select-all. The widget owns ONLY the Set of selected ids;
   *  bulk UI composes via `toolbarEnd` (HARD RULE 5). Uncontrolled by default —
   *  pass `selectedIds` + `onSelectionChange` to control it (e.g. to clear the
   *  selection after a bulk write). */
  selectable?: boolean;
  /** Excludes locked records: unselectable rows render a disabled checkbox and
   *  are skipped by select-all. */
  isRowSelectable?: (row: TableRow<T>) => boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  /** Trailing per-row icon actions. Hover-revealed on fine pointers, always
   *  visible on touch. Never the row's ONLY affordance — detail stays onRowClick. */
  actions?: TableRowAction<T>[];
  /** Client-side pagination — ON BY DEFAULT: above 10 rows the table paginates
   *  itself (a reliability default, not an agent decision — a 200-row register
   *  must never render as one endless page because a build forgot a prop).
   *  Pass `{ pageSize }` to tune, `false` for the render-everything table.
   *  Ignored while `groupBy` is set (groups collapse instead of paginating). */
  pagination?: { pageSize: number } | false;
  /** CSV toolbar button — exports the CURRENT filtered+sorted view (all pages,
   *  all non-hidden columns, raw values). Client-side, zero deps; `locale:'de'`
   *  writes semicolon-separated with comma decimals (Excel-de). */
  exportable?: boolean;
  /** Flat grouping: MUST equal a `column.key`. Groups form on the RAW value's
   *  label, ordered by first appearance after sort; headers collapse on click. */
  groupBy?: string;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
  /** Widget-wide full-order override (e.g. composite "by customer, then date"). */
  sortComparator?: (a: TableRow<T>, b: TableRow<T>) => number;
  /** Responsive column shedding (480px→full width). Default true — low-priority
   *  columns drop so the important ones fit without horizontal scroll; shed data
   *  stays reachable via the row-click overlay. `false` = the plain scroll table. */
  responsiveColumns?: boolean;
  /** Never shed below this many columns (then the table scrolls). Default 1. */
  minColumns?: number;
  /** Widget-wide cell override — a column's own `renderCell` wins over this. */
  renderCell?: (value: unknown, row: TableRow<T>, column: TableColumn<T>,
                ctx: { selected: boolean; stopRowClick: () => void }) => ReactNode;
  /** Widget-wide header override — a column's own `renderHeader` wins. */
  renderHeader?: (column: TableColumn<T>) => ReactNode;
  /** Custom group header (chevron + label + count by default). `toggle` flips
   *  the group's collapse; the widget keeps the full-width row chrome. */
  renderGroupHeader?: (ctx: { key: string; label: ReactNode; rows: TableRow<T>[];
                              collapsed: boolean; toggle: () => void }) => ReactNode;
  /** Replaces the default aggregate footer row. Return `<tr>…</tr>` — rendered
   *  inside the table's tfoot, aligned with the VISIBLE columns. */
  renderFooter?: (ctx: { columns: TableColumn<T>[]; rows: TableRow<T>[] }) => ReactNode;
  /** Injected into the toolbar, left (after the search box). */
  toolbarStart?: ReactNode;
  /** Injected into the toolbar, right — THE seam for a bulk-action bar. */
  toolbarEnd?: ReactNode;
  /** Filter/legend band rendered above the table. */
  children?: ReactNode;
};

// ── value helpers (total, defensive — never throw) ──────────────────────

function labelOf(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object' && 'label' in (v as Record<string, unknown>)) {
    return String((v as { label?: unknown }).label ?? '');
  }
  if (typeof v === 'object') return '';   // unknown object (malformed lookup) → never "[object Object]"
  return String(v);
}

/** The comparable/searchable scalar behind a raw value: numbers stay numbers,
 *  lookups unwrap to their label, arrays join their labels. */
function scalarOf(value: unknown): string | number {
  if (value == null) return '';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(labelOf).join(', ');
  if (typeof value === 'object' && 'label' in (value as Record<string, unknown>)) return labelOf(value);
  return '';   // unknown shape (e.g. a geo object slipped past the searchable gate) → not "[object Object]"
}

function alignClass(align: TableColumn['align']): string {
  return align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : '';
}

function defaultAlign<T>(col: TableColumn<T>): TableColumn<T>['align'] {
  if (col.align) return col.align;
  return col.format === 'number' || col.format === 'currency' ? 'right' : 'left';
}

function isSortable<T>(col: TableColumn<T>): boolean {
  return col.sortable ?? (col.format !== 'geo' && col.format !== 'file');
}

function isSearchable<T>(col: TableColumn<T>): boolean {
  return col.searchable ?? (col.format !== 'geo' && col.format !== 'file');
}

function filterKindOf<T>(col: TableColumn<T>): TableFilterKind {
  if (col.filterKind) return col.filterKind;
  const f = col.format ?? 'text';
  if (f === 'pill' || f === 'multipill' || f === 'bool') return 'set';
  if (f === 'number' || f === 'currency' || f === 'date' || f === 'datetime') return 'range';
  return 'contains';
}

/** One filter's UI state — which fields matter depends on the control kind.
 *  'set' filters are MULTI-select (`v` is the checked option values) — the
 *  faceted-filter standard (shadcn DataTable / AG Grid Set Filter). */
type FilterState = { q?: string; min?: string; max?: string; v?: string[] };

function filterIsActive(fs: FilterState | undefined): boolean {
  return !!fs && (!!(fs.q && fs.q.trim()) || !!fs.min || !!fs.max || !!(fs.v && fs.v.length > 0));
}

// ── responsive column shedding (measured on the CONTAINER, never per cell) ──
// Assumed rendered width + base priority per format — a static lookup, so the fit
// is deterministic for a given container width (snapshot/tsc-safe).
const MIN_WIDTH_BY_FORMAT: Record<TableCellFormat, number> = {
  text: 120, longtext: 180, date: 100, datetime: 140, currency: 104, bool: 64,
  email: 168, url: 160, pill: 110, number: 96, multipill: 180, geo: 150, file: 130,
};
const BASE_PRIORITY_BY_FORMAT: Record<TableCellFormat, number> = {
  // Money/quantity and compact categoricals rank ABOVE generic text so a register's
  // key column (e.g. a currency "Wert") survives shedding WITHOUT needing an explicit
  // `priority` — a plain secondary text column (e.g. a location) sheds before it.
  // email ranks with text: in a directory/contacts register it IS the payload
  // (a v1.2 review shed Telefon+E-Mail from a Mitarbeiterverzeichnis on desktop).
  currency: 60, number: 55, pill: 50, bool: 50, text: 45, email: 45, date: 40,
  datetime: 40, url: 30, longtext: 20, multipill: 20, geo: 20, file: 20,
};

// Fixed-width chrome the shedding budget reserves besides data columns.
const SELECT_COL_W = 56;
const ACTION_BTN_W = 36;
// Auto-pagination threshold & page size (pagination prop overrides).
const AUTO_PAGE_SIZE = 10;

function mw<T>(col: TableColumn<T>): number {
  const base = typeof col.width === 'number' ? col.width : (col.minWidth ?? MIN_WIDTH_BY_FORMAT[col.format ?? 'text']);
  return base + (isSortable(col) ? 28 : 0);   // +28 reserves the sort-icon slot
}

function pri<T>(col: TableColumn<T>, isIdentity: boolean): number {
  if (isIdentity || col.responsive === 'keep') return Infinity;
  const base = col.priority ?? BASE_PRIORITY_BY_FORMAT[col.format ?? 'text'];
  // An aggregated column carries the table's ANSWER (the total the consumer
  // asked for) — shedding it silently drops the sum row. Strong bonus, applied
  // on explicit priorities too (an agent ranking "kosten: 60" under two date
  // columns is exactly the mistake this catches).
  return col.aggregate ? base + 25 : base;
}

// ── density presets (discrete — never auto-measured row heights) ─────────
const DENSITY_TABLE: Record<TableDensity, string> = {
  compact: '[&_tbody_td]:whitespace-normal [&_tbody_td]:px-6 [&_tbody_td]:py-1 [&_tbody_td]:text-sm [&_tbody_td]:font-medium [&_tbody_tr:first-child_td]:pt-4 [&_tbody_tr:last-child_td]:pb-6',
  standard: '[&_tbody_td]:whitespace-normal [&_tbody_td]:px-6 [&_tbody_td]:py-2 [&_tbody_td]:text-base [&_tbody_td]:font-medium [&_tbody_tr:first-child_td]:pt-6 [&_tbody_tr:last-child_td]:pb-10',
  comfortable: '[&_tbody_td]:whitespace-normal [&_tbody_td]:px-6 [&_tbody_td]:py-4 [&_tbody_td]:text-base [&_tbody_td]:font-medium [&_tbody_tr:first-child_td]:pt-8 [&_tbody_tr:last-child_td]:pb-12',
};

// Action-icon tones follow the family palette (TONE_DOT's emerald/amber line).
const ACTION_TONE: Record<TableTone, string> = {
  default: 'text-muted-foreground hover:text-foreground',
  primary: 'text-primary hover:text-primary/80',
  success: 'text-emerald-600 hover:text-emerald-700',
  warning: 'text-amber-600 hover:text-amber-700',
  destructive: 'text-destructive hover:text-destructive/80',
};

// ── the one cell renderer (mirrors RecordView's renderFieldValue) ───────

function renderValue(value: unknown, format: TableCellFormat, locale: 'de' | 'en', empty: ReactNode): ReactNode {
  if (value == null || value === '') return <span className="text-muted-foreground">{empty}</span>;
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
  switch (format) {
    case 'longtext':
      return <span className="whitespace-pre-wrap break-words">{String(value)}</span>;
    case 'date':
      return formatDate(String(value));
    case 'datetime':
      return formatDateTime(String(value));
    case 'number': {
      const n = Number(value);
      return Number.isFinite(n)
        ? <span className="whitespace-nowrap tabular-nums">{n.toLocaleString(locale === 'de' ? 'de-DE' : 'en-US')}</span>
        : <span className="text-muted-foreground">{empty}</span>;
    }
    case 'currency': {
      const n = Number(value);
      return Number.isFinite(n)
        ? <span className="whitespace-nowrap tabular-nums">{formatCurrency(n)}</span>
        : <span className="text-muted-foreground">{empty}</span>;
    }
    case 'bool':
      return typeof value === 'boolean'
        ? (value ? '✓' : '—')
        : <span className="text-muted-foreground">{empty}</span>;
    case 'email':
      return <a href={`mailto:${value}`} onClick={stop} className="text-primary hover:underline break-all">{String(value)}</a>;
    case 'url': {
      const s = String(value);
      return <a href={s} target="_blank" rel="noreferrer" onClick={stop} className="text-primary hover:underline break-all">{s}</a>;
    }
    case 'pill': {
      const label = labelOf(value);
      return label ? <span className={BLUE_PILL}>{label}</span> : <span className="text-muted-foreground">{empty}</span>;
    }
    case 'multipill': {
      const arr = Array.isArray(value) ? value : [value];
      const labels = arr.map(labelOf).filter(Boolean);
      return labels.length
        ? <span className="flex flex-wrap gap-1">{labels.map((l, i) => <span key={i} className={BLUE_PILL}>{l}</span>)}</span>
        : <span className="text-muted-foreground">{empty}</span>;
    }
    case 'geo': {
      const g = value as { lat?: unknown; long?: unknown; info?: unknown };
      if (g?.info) return <span className="break-words">{String(g.info)}</span>;
      const lat = Number(g?.lat);
      const long = Number(g?.long);
      return Number.isFinite(lat) && Number.isFinite(long)
        ? <span className="tabular-nums text-muted-foreground">{lat.toFixed(4)}, {long.toFixed(4)}</span>
        : <span className="text-muted-foreground">{empty}</span>;
    }
    case 'file': {
      const f = value as { url?: unknown; name?: unknown };
      const url = typeof value === 'string' ? value : typeof f?.url === 'string' ? f.url : undefined;
      const name = typeof f?.name === 'string' ? f.name : url ? String(url).split('/').pop() : undefined;
      return url
        ? <a href={String(url)} target="_blank" rel="noreferrer" onClick={stop} className="inline-flex items-center gap-1 text-primary hover:underline"><IconFile size={14} className="shrink-0" />{name ?? UI[locale].file}</a>
        : <span className="inline-flex items-center gap-1 text-muted-foreground"><IconFile size={14} className="shrink-0" />{name ?? empty}</span>;
    }
    case 'text':
    default:
      return <span className="break-words">{typeof value === 'object' ? labelOf(value) : String(value)}</span>;
  }
}

export function TableWidget<T = unknown>({
  columns,
  rows,
  locale = 'de',
  density = 'standard',
  searchable = true,
  searchPlaceholder,
  emptyText = '—',
  className,
  onRowClick,
  toneForRow,
  selectable = false,
  isRowSelectable,
  selectedIds,
  onSelectionChange,
  actions,
  pagination,
  exportable = false,
  groupBy,
  initialSort,
  sortComparator,
  responsiveColumns = true,
  minColumns = 1,
  renderCell,
  renderHeader,
  renderGroupHeader,
  renderFooter,
  toolbarStart,
  toolbarEnd,
  children,
}: TableWidgetProps<T>) {
  const ui = UI[locale];
  const { ref, narrow, width } = useNarrowContainer();
  const coarse = useCoarsePointer();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(initialSort ?? null);
  const [filters, setFilters] = useState<Record<string, FilterState>>({});
  const [page, setPage] = useState(0);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());
  // Columns the USER re-pinned via the +N chooser. A pin ADDS to the visible
  // set (it never evicts another column — the table grows and scrolls
  // instead). Pins are DELIBERATELY ephemeral: the chooser is a look-up
  // affordance, not a configuration surface — a reload returns to the state
  // the dashboard defines. A column that should ALWAYS show is a dashboard
  // decision (`priority: 100` — ask for it in the prompt), never hidden
  // per-device state that makes the same dashboard render differently.
  const [userPinned, setUserPinned] = useState<Set<string>>(() => new Set());
  const [chooserOpen, setChooserOpen] = useState(false);
  // Which faceted-filter popover is open ('__all__' = the narrow filter sheet).
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [internalSel, setInternalSel] = useState<Set<string>>(() => new Set());
  // `stopRowClick` from a renderCell sets this; the row's own click reads+clears it.
  const suppressRowClick = useRef(false);
  const warnedControlled = useRef(false);
  if (selectedIds && !onSelectionChange && !warnedControlled.current) {
    warnedControlled.current = true;
    console.warn('TableWidget: `selectedIds` is set without `onSelectionChange` — the selection can never change.');
  }
  const sel = selectedIds ?? internalSel;
  const setSel = (ids: Set<string>) => {
    if (!selectedIds) setInternalSel(ids);
    onSelectionChange?.(ids);
  };

  const cols = useMemo(() => columns.filter(c => !c.hidden), [columns]);
  const getValue = (col: TableColumn<T>, row: TableRow<T>): unknown =>
    col.accessor ? col.accessor(row) : (row.data as Record<string, unknown>)?.[col.key];

  const hasActions = !!actions && actions.length > 0;

  // The column that is NEVER shed / becomes the card title — one source of truth.
  const titleCol = cols.find(c => c.cardRole === 'title') ?? cols.find(c => (c.format ?? 'text') === 'text') ?? cols[0];

  // Responsive shedding: on a measured container (>=480px) keep the highest-
  // priority columns that fit the width and drop the rest (still reachable via the
  // row-click overlay + search + sort). Presence toggles; column ORDER never
  // reshuffles. Deterministic for a given rounded width — snapshot/tsc-safe.
  const { visibleCols, hiddenCount } = useMemo(() => {
    const identity = titleCol;
    if (!responsiveColumns || narrow || width === 0 || !identity) return { visibleCols: cols, hiddenCount: 0 };
    const budget = width - 48;   // the wrapper's [&_tbody_td]:px-6 → 24px each side
    const ranked = cols
      .map((c, i) => ({ c, i, p: pri(c, c === identity) }))
      .sort((a, b) => b.p - a.p || a.i - b.i);
    const kept = new Set<TableColumn<T>>([identity]);
    // Selection + actions are chrome the data columns must share the budget with.
    let used = mw(identity)
      + (selectable ? SELECT_COL_W : 0)
      + (hasActions ? 24 + actions!.length * ACTION_BTN_W : 0);
    for (const { c, p } of ranked) {
      if (kept.has(c)) continue;
      if (p === Infinity) { kept.add(c); used += mw(c); continue; }   // pinned: always kept
      if (used + mw(c) <= budget) { kept.add(c); used += mw(c); }
    }
    const floor = Math.min(Math.max(1, minColumns), cols.length);
    for (const { c } of ranked) { if (kept.size >= floor) break; kept.add(c); }
    // User pins are a UNION on top of the auto plan — a pin never evicts an
    // auto-kept column (silent eviction felt like the table swallowing data).
    const visible = cols.filter(c => kept.has(c) || userPinned.has(c.key));
    return { visibleCols: visible, hiddenCount: cols.length - visible.length };
  }, [cols, width, narrow, responsiveColumns, minColumns, titleCol, selectable, hasActions, actions, userPinned]);
  const hiddenCols = useMemo(() => cols.filter(c => !visibleCols.includes(c)), [cols, visibleCols]);

  // Deterministic column widths: table-layout FIXED + a colgroup computed from
  // the same mw() weights the shedding budget uses — plan and reality can never
  // diverge (v1.3 shipped an 81px browser-auto overflow that pushed the table
  // into an invisible scroll zone and clipped right-aligned content).
  const useFixedLayout = responsiveColumns && !narrow && width > 0;
  const colWidths = useMemo(() => {
    if (!useFixedLayout) return null;
    const reserved = (selectable ? SELECT_COL_W : 0) + (hasActions ? 24 + actions!.length * ACTION_BTN_W : 0);
    const dataPx = Math.max(width - reserved, 0);
    const sum = visibleCols.reduce((s, c) => s + mw(c), 0) || 1;
    // Room to spare → stretch the plan to fill the card. User pins pushed the
    // plan PAST the container → keep the planned widths and let the wrapper
    // scroll horizontally: the pinned column arrives, nothing gets squeezed
    // unreadable, nothing silently disappears.
    const scale = sum < dataPx ? dataPx / sum : 1;
    const m: Record<string, number> = {};
    for (const c of visibleCols) m[c.key] = Math.floor(mw(c) * scale);
    return m;
  }, [useFixedLayout, width, selectable, hasActions, actions, visibleCols]);

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    const searchCols = cols.filter(isSearchable);
    return rows.filter(row => searchCols.some(c => String(scalarOf(getValue(c, row))).toLowerCase().includes(q)));
  }, [rows, search, cols]);

  // ── per-column filters (raw accessor values, like sort/search) ──────────
  const filterCols = useMemo(() => cols.filter(c => c.filterable), [cols]);
  const activeFilterCount = filterCols.filter(c => filterIsActive(filters[c.key])).length;
  const patchFilter = (key: string, patch: FilterState) => {
    setFilters(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
    setPage(0);
  };

  // Options per 'set' filter — labels + FACET COUNTS across ALL rows (the
  // shadcn/AG-Grid set-filter convention: every option shows how many rows
  // carry it, so a user sees what a check will do before checking).
  const setOptions = useMemo(() => {
    const m: Record<string, { v: string; label: string; count: number }[]> = {};
    for (const col of filterCols) {
      if (filterKindOf(col) !== 'set') continue;
      const counts = new Map<string, number>();
      for (const row of rows) {
        const raw = getValue(col, row);
        if ((col.format ?? 'text') === 'bool') {
          const k = raw === true ? 'true' : 'false';
          counts.set(k, (counts.get(k) ?? 0) + 1);
        } else if (Array.isArray(raw)) {
          for (const item of raw) { const l = labelOf(item); if (l) counts.set(l, (counts.get(l) ?? 0) + 1); }
        } else {
          const s = String(scalarOf(raw));
          if (s) counts.set(s, (counts.get(s) ?? 0) + 1);
        }
      }
      m[col.key] = (col.format ?? 'text') === 'bool'
        ? [{ v: 'true', label: ui.yes, count: counts.get('true') ?? 0 }, { v: 'false', label: ui.no, count: counts.get('false') ?? 0 }]
        : Array.from(counts, ([v, count]) => ({ v, label: v, count }))
            .sort((a, b) => a.label.localeCompare(b.label, locale === 'de' ? 'de-DE' : 'en-US'));
    }
    return m;
  }, [rows, filterCols, locale]);

  const filtered = useMemo(() => {
    const active = filterCols
      .map(c => [c, filters[c.key]] as const)
      .filter(([, fs]) => filterIsActive(fs));
    if (!active.length) return searched;
    return searched.filter(row => active.every(([col, fs]) => {
      const raw = getValue(col, row);
      const kind = filterKindOf(col);
      if (kind === 'contains') {
        return String(scalarOf(raw)).toLowerCase().includes(fs!.q!.trim().toLowerCase());
      }
      if (kind === 'set') {
        const sel = fs!.v!;   // multi-select: a row matches ANY checked value
        if ((col.format ?? 'text') === 'bool') return sel.includes(raw === true ? 'true' : 'false');
        if (Array.isArray(raw)) return raw.map(labelOf).some(l => sel.includes(l));
        return sel.includes(String(scalarOf(raw)));
      }
      // range — dates compare on the ISO date part, numbers numerically
      if (col.format === 'date' || col.format === 'datetime') {
        const s = String(raw ?? '').slice(0, 10);
        if (!s) return false;
        if (fs!.min && s < fs!.min) return false;
        if (fs!.max && s > fs!.max) return false;
        return true;
      }
      const n = Number(scalarOf(raw));
      if (!Number.isFinite(n)) return false;
      if (fs!.min && n < Number(fs!.min)) return false;
      if (fs!.max && n > Number(fs!.max)) return false;
      return true;
    }));
  }, [searched, filters, filterCols]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = cols.find(c => c.key === sort.key);
    if (!col) return filtered;
    const base = sortComparator ?? col.sortComparator ?? ((a: TableRow<T>, b: TableRow<T>) => {
      const av = scalarOf(getValue(col, a));
      const bv = scalarOf(getValue(col, b));
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv), locale === 'de' ? 'de-DE' : 'en-US');
    });
    // Negate for desc (instead of sort-then-reverse) — equal rows keep their order.
    const cmp = sort.dir === 'desc'
      ? (a: TableRow<T>, b: TableRow<T>) => -base(a, b)
      : base;
    return [...filtered].sort(cmp);
  }, [filtered, sort, cols, sortComparator, locale]);

  const toggleSort = (key: string) =>
    setSort(prev => (prev && prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  // ── selection (state only — bulk UI composes via toolbarEnd) ────────────
  const rowSelectable = (row: TableRow<T>): boolean => isRowSelectable?.(row) ?? true;
  const selectableRows = useMemo(
    () => (selectable ? sorted.filter(rowSelectable) : []),
    [sorted, selectable, isRowSelectable],
  );
  const allSelected = selectableRows.length > 0 && selectableRows.every(r => sel.has(r.id));
  const toggleAll = () => setSel(allSelected ? new Set<string>() : new Set(selectableRows.map(r => r.id)));
  const toggleRow = (row: TableRow<T>) => {
    const next = new Set(sel);
    if (next.has(row.id)) next.delete(row.id); else next.add(row.id);
    setSel(next);
  };

  // ── grouping XOR pagination ─────────────────────────────────────────────
  const groupCol = groupBy ? cols.find(c => c.key === groupBy) : undefined;
  const groups = useMemo(() => {
    if (!groupCol) return null;
    const map = new Map<string, TableRow<T>[]>();
    for (const row of sorted) {
      const label = String(scalarOf(getValue(groupCol, row))) || '—';
      const list = map.get(label);
      if (list) list.push(row); else map.set(label, [row]);
    }
    return Array.from(map, ([key, groupRows]) => ({ key, rows: groupRows }));
  }, [sorted, groupCol]);
  const toggleGroup = (key: string) => setCollapsedGroups(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  // Auto-pagination: undefined = paginate above AUTO_PAGE_SIZE rows; false = off.
  const pageSize = groups ? 0
    : pagination === false ? 0
    : pagination ? pagination.pageSize
    : sorted.length > AUTO_PAGE_SIZE ? AUTO_PAGE_SIZE : 0;
  const pageCount = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const pagedRows = pageSize > 0 ? sorted.slice(safePage * pageSize, (safePage + 1) * pageSize) : sorted;

  // ── aggregates (over the CURRENT filtered view — all pages) ─────────────
  const hasAggregates = cols.some(c => c.aggregate);
  const aggregateOf = (col: TableColumn<T>, aggRows: TableRow<T>[]): ReactNode => {
    const a = col.aggregate;
    if (!a) return null;
    if (typeof a === 'function') return a(aggRows);
    if (a === 'count') return <span className="tabular-nums">{aggRows.length.toLocaleString(locale === 'de' ? 'de-DE' : 'en-US')}</span>;
    const nums = aggRows.map(r => Number(scalarOf(getValue(col, r)))).filter(n => Number.isFinite(n));
    if (!nums.length) return <span className="text-muted-foreground">—</span>;
    const sum = nums.reduce((s, n) => s + n, 0);
    const val = a === 'avg' ? sum / nums.length : sum;
    return col.format === 'currency'
      ? <span className="tabular-nums">{formatCurrency(val)}</span>
      : <span className="tabular-nums">{val.toLocaleString(locale === 'de' ? 'de-DE' : 'en-US', { maximumFractionDigits: 2 })}</span>;
  };

  // ── CSV export (current filtered+sorted view, raw values, zero deps) ────
  const exportCsv = () => {
    const sep = locale === 'de' ? ';' : ',';
    const esc = (s: string) => (s.includes(sep) || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s);
    const cellText = (col: TableColumn<T>, row: TableRow<T>): string => {
      const raw = getValue(col, row);
      if (typeof raw === 'boolean') return raw ? 'true' : 'false';
      const s = scalarOf(raw);
      // Excel-de pairs the semicolon separator with comma decimals.
      return typeof s === 'number' && locale === 'de' ? String(s).replace('.', ',') : String(s);
    };
    const header = cols.map(c => esc(typeof c.label === 'string' ? c.label : c.key)).join(sep);
    const lines = [header, ...sorted.map(row => cols.map(c => esc(cellText(c, row))).join(sep))];
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toneOf = (row: TableRow<T>): TableTone | undefined => {
    const t = toneForRow?.(row) ?? row.tone;
    return t && t !== 'default' ? t : undefined;
  };

  // Narrow (card) layout roles (titleCol hoisted above, shared with the fit memo).
  // Marking ONLY a title (the common agent move) must never empty the card:
  // without at least one explicit 'body' column, every non-title/subtitle
  // column becomes the body — 'title' means "this is the heading", not
  // "hide everything else".
  const subtitleCol = cols.find(c => c.cardRole === 'subtitle');
  const explicitBodyCols = cols.filter(c => c.cardRole === 'body');
  const bodyCols = explicitBodyCols.length > 0
    ? explicitBodyCols
    : cols.filter(c => c !== titleCol && c !== subtitleCol);

  const cellCtx = (row: TableRow<T>) => ({
    selected: sel.has(row.id),
    stopRowClick: () => { suppressRowClick.current = true; },
  });

  const clickProps = (row: TableRow<T>) =>
    onRowClick
      ? {
          onClick: (e: { target: unknown }) => {
            const wasSuppressed = suppressRowClick.current;
            suppressRowClick.current = false;
            if (wasSuppressed) return;
            // Interactive elements never double-fire the row (AdminPage's closest() rule).
            const el = e.target as { closest?: (sel: string) => unknown } | null;
            if (el && typeof el.closest === 'function' && el.closest('button, a, input, select, [role="checkbox"]')) return;
            onRowClick(row);
          },
          role: 'button' as const,
          tabIndex: 0,
          onKeyDown: (e: { key: string; preventDefault: () => void }) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(row); }
          },
        }
      : {};

  const rowActionsOf = (row: TableRow<T>): TableRowAction<T>[] =>
    hasActions ? actions!.filter(a => !a.hidden?.(row)) : [];

  const filterLabel = (col: TableColumn<T>): string =>
    typeof col.label === 'string' ? col.label : col.key;

  // ── faceted filters (the shadcn-DataTable toolbar school) ───────────────
  // One CONTROL SHAPE per filter kind, reused by the desktop popovers and the
  // narrow stacked panel — the filter UI never varies between dashboards.
  const filterPanel = (col: TableColumn<T>): ReactNode => {
    const kind = filterKindOf(col);
    const fs = filters[col.key] ?? {};
    if (kind === 'set') {
      const opts = setOptions[col.key] ?? [];
      const sel = fs.v ?? [];
      return (
        <div className="flex max-h-64 flex-col overflow-y-auto">
          {opts.map(o => {
            const checked = sel.includes(o.v);
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => patchFilter(col.key, { v: checked ? sel.filter(x => x !== o.v) : [...sel, o.v] })}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
              >
                <span aria-hidden className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border text-[10px] leading-none ${checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}>{checked ? '✓' : ''}</span>
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                <span className="tabular-nums text-xs text-muted-foreground">{o.count}</span>
              </button>
            );
          })}
          {sel.length > 0 && (
            <button type="button" onClick={() => patchFilter(col.key, { v: [] })} className="mt-1 border-t border-input px-2 pt-2 pb-1 text-left text-sm text-muted-foreground transition-colors hover:text-foreground">
              {ui.clearFilters}
            </button>
          )}
        </div>
      );
    }
    if (kind === 'range') {
      const inputType = col.format === 'date' || col.format === 'datetime' ? 'date' : 'number';
      return (
        <div className="flex flex-col gap-2 p-1">
          <label className="flex items-center gap-2 text-sm">
            <span className="w-8 shrink-0 text-xs text-muted-foreground">{ui.from}</span>
            <Input type={inputType} value={fs.min ?? ''} onChange={e => patchFilter(col.key, { min: e.target.value })} className="h-8 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-8 shrink-0 text-xs text-muted-foreground">{ui.to}</span>
            <Input type={inputType} value={fs.max ?? ''} onChange={e => patchFilter(col.key, { max: e.target.value })} className="h-8 text-sm" />
          </label>
          {(fs.min || fs.max) && (
            <button type="button" onClick={() => patchFilter(col.key, { min: '', max: '' })} className="px-1 text-left text-sm text-muted-foreground transition-colors hover:text-foreground">
              {ui.clearFilters}
            </button>
          )}
        </div>
      );
    }
    return (
      <div className="p-1">
        <Input value={fs.q ?? ''} onChange={e => patchFilter(col.key, { q: e.target.value })} placeholder={`${filterLabel(col)} …`} aria-label={filterLabel(col)} className="h-8 text-sm" />
      </div>
    );
  };

  // The active-state summary INSIDE the trigger button (badges, shadcn-style).
  const filterSummary = (col: TableColumn<T>): ReactNode => {
    const fs = filters[col.key];
    if (!filterIsActive(fs)) return null;
    const kind = filterKindOf(col);
    let text: string;
    if (kind === 'set') {
      const sel = fs!.v!;
      const labels = (setOptions[col.key] ?? []).filter(o => sel.includes(o.v)).map(o => o.label);
      text = labels.length > 2 ? ui.selected(labels.length) : labels.join(', ');
    } else if (kind === 'range') {
      text = `${fs!.min || '…'} – ${fs!.max || '…'}`;
    } else {
      text = fs!.q!.trim();
    }
    return (
      <>
        <span aria-hidden className="mx-0.5 h-4 w-px bg-input" />
        <span className="max-w-32 truncate rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">{text}</span>
      </>
    );
  };

  const colSpanAll = visibleCols.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0);
  const showToolbar = (searchable && rows.length > 0) || hiddenCount > 0
    || (filterCols.length > 0 && rows.length > 0)
    || (exportable && sorted.length > 0) || toolbarStart != null || toolbarEnd != null;
  const searchingOrFiltering = !!search.trim() || activeFilterCount > 0;

  // ── narrow card (shared by the grouped and flat branches) ───────────────
  const renderCard = (row: TableRow<T>) => {
    const tone = toneOf(row);
    const cardActions = rowActionsOf(row);
    return (
      <div
        key={row.id}
        {...clickProps(row)}
        className={`rounded-2xl bg-card shadow-lg border-l-4 px-4 py-3 transition-opacity ${tone ? TONE_ACCENT[tone] : 'border-l-transparent'} ${onRowClick ? 'cursor-pointer active:opacity-70' : ''}`}
      >
        <div className="flex items-start gap-3">
          {selectable && (
            <Checkbox
              className="mt-1 shrink-0"
              checked={sel.has(row.id)}
              disabled={!rowSelectable(row)}
              onCheckedChange={() => toggleRow(row)}
              aria-label={ui.selectRow}
            />
          )}
          <div className="min-w-0 flex-1">
            {titleCol && <div className="font-semibold text-foreground break-words">{titleCol.renderCell ? titleCol.renderCell(getValue(titleCol, row), row, cellCtx(row)) : renderCell ? renderCell(getValue(titleCol, row), row, titleCol, cellCtx(row)) : renderValue(getValue(titleCol, row), titleCol.format ?? 'text', locale, emptyText)}</div>}
            {subtitleCol && <div className="text-sm text-muted-foreground break-words">{renderValue(getValue(subtitleCol, row), subtitleCol.format ?? 'text', locale, emptyText)}</div>}
          </div>
        </div>
        {bodyCols.length > 0 && (
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            {bodyCols.map(col => (
              <div key={col.key} className="contents">
                <dt className="text-muted-foreground">{col.label}</dt>
                <dd className="min-w-0 text-right text-foreground">{col.renderCell ? col.renderCell(getValue(col, row), row, cellCtx(row)) : renderCell ? renderCell(getValue(col, row), row, col, cellCtx(row)) : renderValue(getValue(col, row), col.format ?? 'text', locale, emptyText)}</dd>
              </div>
            ))}
          </dl>
        )}
        {cardActions.length > 0 && (
          <div className="mt-2 flex justify-end gap-1">
            {cardActions.map(action => (
              <button
                key={action.label}
                type="button"
                aria-label={action.label}
                title={action.label}
                onClick={() => action.onClick(row)}
                className={`rounded-md p-1.5 transition-colors hover:bg-muted ${ACTION_TONE[action.tone ?? 'default']}`}
              >
                <action.icon size={16} stroke={1.8} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── desktop data row (shared by the grouped and flat branches) ──────────
  const renderDataRow = (row: TableRow<T>) => {
    const tone = toneOf(row);
    const toneCls = `border-l-4 ${tone ? TONE_ACCENT[tone] : 'border-l-transparent'}`;
    const rowActions = rowActionsOf(row);
    return (
      <TableRow
        key={row.id}
        {...clickProps(row)}
        className={`group transition-colors ${onRowClick ? 'cursor-pointer' : ''} hover:bg-muted/50 ${sel.has(row.id) ? 'bg-primary/5' : ''}`}
      >
        {selectable && (
          // The tone shows as a coloured LEFT BAR on the first cell (a border-l
          // on a <tr> is a no-op with separate table borders; on a <td> it
          // renders) — matching the narrow-card left accent.
          <TableCell className={`w-10 ${toneCls}`}>
            <Checkbox
              checked={sel.has(row.id)}
              disabled={!rowSelectable(row)}
              onCheckedChange={() => toggleRow(row)}
              aria-label={ui.selectRow}
            />
          </TableCell>
        )}
        {visibleCols.map((col, ci) => (
          <TableCell
            key={col.key}
            className={`${!selectable && ci === 0 ? toneCls : ''} ${alignClass(defaultAlign(col))} ${col.className ?? ''}`}
          >
            {col.renderCell
              ? col.renderCell(getValue(col, row), row, cellCtx(row))
              : renderCell
                ? renderCell(getValue(col, row), row, col, cellCtx(row))
                : renderValue(getValue(col, row), col.format ?? 'text', locale, emptyText)}
          </TableCell>
        ))}
        {hasActions && (
          <TableCell className="w-px whitespace-nowrap">
            <span className={`flex items-center justify-end gap-1 ${coarse ? '' : 'opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'}`}>
              {rowActions.map(action => (
                <button
                  key={action.label}
                  type="button"
                  aria-label={action.label}
                  title={action.label}
                  onClick={() => action.onClick(row)}
                  className={`rounded-md p-1.5 transition-colors hover:bg-muted ${ACTION_TONE[action.tone ?? 'default']}`}
                >
                  <action.icon size={16} stroke={1.8} />
                </button>
              ))}
            </span>
          </TableCell>
        )}
      </TableRow>
    );
  };

  // The default group header shows the PER-GROUP totals of every aggregated
  // column automatically — the main reason agents hand-rolled renderGroupHeader
  // (and clipped it). Chevron + name + count left, subtotals right, inside the
  // same px-6 gutter as the cells.
  const aggCols = cols.filter(c => c.aggregate);
  const defaultGroupHeader = (key: string, groupRows: TableRow<T>[], isCollapsed: boolean) => (
    <div className="flex w-full items-center gap-3 px-6 py-2.5">
      <button
        type="button"
        onClick={() => toggleGroup(key)}
        className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-semibold text-foreground"
      >
        {isCollapsed ? <IconChevronRight size={14} className="shrink-0" /> : <IconChevronDown size={14} className="shrink-0" />}
        <span className="truncate">{key}</span>
        <span className="shrink-0 tabular-nums text-xs font-normal text-muted-foreground">· {groupRows.length}</span>
      </button>
      {aggCols.length > 0 && (
        <span className="flex shrink-0 flex-wrap items-baseline justify-end gap-x-4 gap-y-0.5">
          {aggCols.map(col => (
            <span key={col.key} className="inline-flex items-baseline gap-1.5 text-sm">
              <span className="text-xs text-muted-foreground">{filterLabel(col)}</span>
              <span className="font-medium">{aggregateOf(col, groupRows)}</span>
            </span>
          ))}
        </span>
      )}
    </div>
  );

  return (
    <div ref={ref} className={`flex flex-col gap-4${className ? ` ${className}` : ''}`}>
      {children}

      {showToolbar && (
        // ONE toolbar row (the shadcn-DataTable reference): search, then the
        // faceted filter triggers, then consumer slots — never stacked bands.
        <div className="flex flex-wrap items-center gap-2">
          {searchable && rows.length > 0 && (
            <div className="relative w-full max-w-56">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder={searchPlaceholder ?? ui.search} className="h-8 pl-9 text-sm" aria-label={searchPlaceholder ?? ui.search} />
            </div>
          )}
          {filterCols.length > 0 && rows.length > 0 && (
            narrow ? (
              <button
                type="button"
                onClick={() => setOpenFilter(o => (o === '__all__' ? null : '__all__'))}
                aria-expanded={openFilter === '__all__'}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-input px-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <IconFilter size={14} />
                {ui.filters}
                {activeFilterCount > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{activeFilterCount}</span>
                )}
              </button>
            ) : (
              <>
                {filterCols.map(col => (
                  <span
                    key={col.key}
                    className="relative"
                    // Escape anywhere inside the popover closes it and returns
                    // focus to its trigger (the first button in this wrapper).
                    onKeyDown={e => {
                      if (e.key === 'Escape' && openFilter === col.key) {
                        e.stopPropagation();
                        setOpenFilter(null);
                        (e.currentTarget.querySelector('button') as HTMLButtonElement | null)?.focus();
                      }
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFilter(o => (o === col.key ? null : col.key))}
                      aria-expanded={openFilter === col.key}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-input px-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <IconCirclePlus size={14} className="shrink-0" />
                      {filterLabel(col)}
                      {filterSummary(col)}
                    </button>
                    {openFilter === col.key && (
                      <>
                        {/* invisible backdrop closes the popover on outside click */}
                        <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setOpenFilter(null)} />
                        <div className="absolute left-0 top-full z-20 mt-1 w-60 rounded-xl border border-input bg-card p-1.5 shadow-lg">
                          {filterPanel(col)}
                        </div>
                      </>
                    )}
                  </span>
                ))}
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => { setFilters({}); setPage(0); }}>
                    <IconX size={14} className="mr-1" />{ui.clearFilters}
                  </Button>
                )}
              </>
            )
          )}
          {toolbarStart}
          <span className="ml-auto inline-flex flex-wrap items-center gap-3">
            {toolbarEnd}
            {exportable && sorted.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportCsv} className="shrink-0">
                <IconDownload size={15} className="mr-1.5" />{ui.exportCsv}
              </Button>
            )}
            {(hiddenCount > 0 || userPinned.size > 0) && (
              <button
                type="button"
                onClick={() => setChooserOpen(o => !o)}
                aria-expanded={chooserOpen}
                title={ui.columnsHidden(hiddenCount)}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted hover:text-foreground ${chooserOpen ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
              >
                <IconColumns size={13} />{hiddenCount > 0 ? `+${hiddenCount}` : ui.columns}
              </button>
            )}
          </span>
        </div>
      )}

      {chooserOpen && (hiddenCols.length > 0 || userPinned.size > 0) && (
        // The +N chooser: hidden columns come back with one tap (they re-pin and
        // the table scrolls if it must); re-pinned ones drop out the same way.
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-dashed border-input px-3 py-2 text-xs">
          <span className="text-muted-foreground">{ui.columns}:</span>
          {hiddenCols.map(col => (
            <button
              key={col.key}
              type="button"
              onClick={() => setUserPinned(prev => { const next = new Set(prev); next.add(col.key); return next; })}
              className="inline-flex items-center gap-1 rounded-full border border-input bg-background px-2.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <span aria-hidden>+</span>{filterLabel(col)}
            </button>
          ))}
          {cols.filter(c => userPinned.has(c.key) && !hiddenCols.includes(c)).map(col => (
            <button
              key={col.key}
              type="button"
              onClick={() => setUserPinned(prev => { const next = new Set(prev); next.delete(col.key); return next; })}
              className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-primary transition-colors"
            >
              {filterLabel(col)}<span aria-hidden>×</span>
            </button>
          ))}
        </div>
      )}

      {narrow && openFilter === '__all__' && filterCols.length > 0 && rows.length > 0 && (
        // Narrow: the ONE "Filter (n)" toolbar trigger expands into a stacked
        // panel (the mobile consensus: filters collapse behind a button).
        <div
          className="flex flex-col gap-3 rounded-xl border border-input bg-card p-3 shadow-sm"
          onKeyDown={e => { if (e.key === 'Escape') setOpenFilter(null); }}
        >
          {filterCols.map(col => (
            <div key={col.key} className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{filterLabel(col)}</span>
              {filterPanel(col)}
            </div>
          ))}
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="self-start" onClick={() => { setFilters({}); setPage(0); }}>
              <IconX size={14} className="mr-1" />{ui.clearFilters}
            </Button>
          )}
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="rounded-[27px] bg-card shadow-lg overflow-hidden">
          <div className="py-16 text-center text-muted-foreground">{searchingOrFiltering ? ui.noResults : emptyText}</div>
        </div>
      ) : narrow ? (
        <div className="flex flex-col gap-3">
          {groups
            ? groups.map(g => {
                const isCollapsed = collapsedGroups.has(g.key);
                return (
                  <div key={g.key} className="flex flex-col gap-3">
                    <div className="rounded-xl bg-muted/40">
                      {renderGroupHeader
                        ? renderGroupHeader({ key: g.key, label: g.key, rows: g.rows, collapsed: isCollapsed, toggle: () => toggleGroup(g.key) })
                        : defaultGroupHeader(g.key, g.rows, isCollapsed)}
                    </div>
                    {!isCollapsed && g.rows.map(renderCard)}
                  </div>
                );
              })
            : pagedRows.map(renderCard)}
        </div>
      ) : (
        <div className="rounded-[27px] bg-card shadow-lg overflow-x-auto">
          <Table className={`${colWidths ? 'table-fixed' : ''} ${DENSITY_TABLE[density]}`}>
            {colWidths && (
              <colgroup>
                {selectable && <col style={{ width: SELECT_COL_W }} />}
                {visibleCols.map(c => (
                  <col key={c.key} style={{ width: typeof c.width === 'string' ? c.width : `${colWidths[c.key]}px` }} />
                ))}
                {hasActions && <col style={{ width: 24 + actions!.length * ACTION_BTN_W }} />}
              </colgroup>
            )}
            <TableHeader className="bg-secondary">
              <TableRow className="border-b border-input">
                {selectable && (
                  <TableHead className="w-10 px-6">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label={ui.selectAll} />
                  </TableHead>
                )}
                {visibleCols.map(col => {
                  const sortable = isSortable(col);
                  const active = sort?.key === col.key;
                  const align = defaultAlign(col);
                  return (
                    <TableHead
                      key={col.key}
                      style={col.width != null ? { width: col.width } : undefined}
                      onClick={sortable ? () => toggleSort(col.key) : undefined}
                      aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                      className={`uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 ${alignClass(align)} ${sortable ? 'cursor-pointer select-none hover:text-foreground transition-colors' : ''}`}
                    >
                      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
                        {col.renderHeader ? col.renderHeader(col) : renderHeader ? renderHeader(col) : col.label}
                        {sortable && (active
                          ? (sort!.dir === 'asc' ? <IconArrowUp size={13} /> : <IconArrowDown size={13} />)
                          : <IconArrowsSort size={13} className="opacity-40" />)}
                      </span>
                    </TableHead>
                  );
                })}
                {hasActions && <TableHead className="w-px px-6" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups
                ? groups.map(g => {
                    const isCollapsed = collapsedGroups.has(g.key);
                    return [
                      <TableRow key={`group:${g.key}`} className="bg-muted/30 hover:bg-muted/40">
                        <TableCell colSpan={colSpanAll} className="!p-0">
                          {renderGroupHeader
                            ? renderGroupHeader({ key: g.key, label: g.key, rows: g.rows, collapsed: isCollapsed, toggle: () => toggleGroup(g.key) })
                            : defaultGroupHeader(g.key, g.rows, isCollapsed)}
                        </TableCell>
                      </TableRow>,
                      ...(isCollapsed ? [] : g.rows.map(renderDataRow)),
                    ];
                  })
                : pagedRows.map(renderDataRow)}
            </TableBody>
            {(hasAggregates || renderFooter) && (
              <tfoot>
                {renderFooter
                  ? renderFooter({ columns: visibleCols, rows: sorted })
                  : (
                    <>
                      <TableRow className="border-t border-input bg-secondary/50 font-medium [&_td]:px-6 [&_td]:py-2">
                        {selectable && <TableCell />}
                        {visibleCols.map((col, ci) => (
                          <TableCell key={col.key} className={`text-sm ${alignClass(defaultAlign(col))}`}>
                            {col.aggregate
                              ? aggregateOf(col, sorted)
                              // The row needs a NAME, not just a naked number — the
                              // first non-aggregated cell labels it.
                              : ci === 0
                                ? <span className="text-xs uppercase tracking-wider text-muted-foreground">{ui.total}</span>
                                : null}
                          </TableCell>
                        ))}
                        {hasActions && <TableCell />}
                      </TableRow>
                      {(() => {
                        // Aggregates of SHED columns survive as a summary line —
                        // shedding a column must never silently drop the total.
                        const shedAggs = hiddenCols.filter(c => c.aggregate);
                        if (!shedAggs.length) return null;
                        return (
                          <TableRow className="bg-secondary/30 [&_td]:px-6 [&_td]:py-1.5">
                            <TableCell colSpan={colSpanAll} className="text-right text-sm">
                              <span className="inline-flex flex-wrap justify-end gap-x-4 gap-y-1">
                                {shedAggs.map(col => (
                                  <span key={col.key} className="inline-flex items-baseline gap-1.5">
                                    <span className="text-xs text-muted-foreground">{filterLabel(col)}</span>
                                    <span className="font-medium">{aggregateOf(col, sorted)}</span>
                                  </span>
                                ))}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })()}
                    </>
                  )}
              </tfoot>
            )}
          </Table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <span className="tabular-nums">{ui.page(safePage + 1, pageCount)}</span>
          <Button variant="outline" size="sm" disabled={safePage === 0} aria-label={ui.prevPage} onClick={() => setPage(safePage - 1)}>
            <IconChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" disabled={safePage >= pageCount - 1} aria-label={ui.nextPage} onClick={() => setPage(safePage + 1)}>
            <IconChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Load / error / empty are SIBLING components, NOT props (KanbanSkeleton /
//    KanbanError precedent): the consumer branches BEFORE the widget. ───────

// Bone widths cycle a fixed pattern — the shimmer looks like DATA (varied),
// stays deterministic (no randomness), and mirrors the real anatomy: toolbar
// (search + filter chips + export), header row, px-6 cell gutter, footer band.
const BONE_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-3/5', 'w-4/5'];

export function TableSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-busy="true">
      <div className="flex items-center gap-2">
        <div className="h-8 w-56 rounded-md bg-muted" />
        <div className="h-8 w-28 rounded-md border border-dashed border-input" />
        <div className="h-8 w-24 rounded-md border border-dashed border-input" />
        <div className="ml-auto h-8 w-20 rounded-md bg-muted" />
      </div>
      <div className="rounded-[27px] bg-card shadow-lg overflow-hidden">
        <div className="grid gap-4 border-b border-input bg-secondary px-6 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, c) => <div key={c} className="h-3 w-20 rounded bg-muted" />)}
        </div>
        <div className="flex flex-col px-6">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="grid gap-4 border-b border-border py-4 last:border-b-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, c) => (
                <div key={c} className={`h-4 rounded bg-muted ${BONE_WIDTHS[(r * columns + c) % BONE_WIDTHS.length]}`} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-input bg-secondary/50 px-6 py-3">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

type TableErrorProps = {
  error: Error | string;
  /** Default texts follow this, like the widget's own strings. */
  locale?: 'de' | 'en';
  title?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: ComponentType<{ size?: number | string; stroke?: number | string }>;
  className?: string;
};

export function TableError({ error, locale = 'de', title, onRetry, retryLabel, icon: Icon = IconAlertCircle, className }: TableErrorProps) {
  const message = typeof error === 'string' ? error : error.message;
  const heading = title ?? UI[locale].errorTitle;
  const retryText = retryLabel ?? UI[locale].retry;
  return (
    <div className={`flex flex-col items-center justify-center gap-4 rounded-[27px] bg-card shadow-lg py-24 text-center${className ? ` ${className}` : ''}`}>
      <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive"><Icon size={22} /></div>
      <div className="flex flex-col gap-1 max-w-md px-6">
        <h3 className="font-semibold text-foreground">{heading}</h3>
        <p className="text-sm text-muted-foreground break-words">{message}</p>
      </div>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}><IconRefresh className="h-4 w-4 mr-1.5" />{retryText}</Button>}
    </div>
  );
}

type TableEmptyProps = {
  icon?: ComponentType<{ size?: number | string; stroke?: number | string }>;
  /** Default texts follow this, like the widget's own strings. */
  locale?: 'de' | 'en';
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function TableEmpty({ icon: Icon = IconInbox, locale = 'de', title, description, action, className }: TableEmptyProps) {
  const heading = title ?? UI[locale].emptyTitle;
  return (
    <div className={`flex flex-col items-center justify-center gap-4 rounded-[27px] bg-card shadow-lg py-24 text-center${className ? ` ${className}` : ''}`}>
      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground"><Icon size={22} /></div>
      <div className="flex flex-col gap-1 max-w-md px-6">
        <h3 className="font-semibold text-foreground">{heading}</h3>
        {description && <p className="text-sm text-muted-foreground break-words">{description}</p>}
      </div>
      {action}
    </div>
  );
}
