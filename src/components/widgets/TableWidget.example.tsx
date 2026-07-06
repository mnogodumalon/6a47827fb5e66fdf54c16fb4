/**
 * TableWidget.example.tsx — the single copyable wiring truth for TableWidget.
 *
 * This file is STATIC (no Jinja2, no conditional emission) and is compiled by
 * the contract tsc-gate against the frozen hotel fixture (entity `buchung`:
 * gast, anreise, preis, and the static lookup `status`). It shows the full
 * wiring the agent reproduces in the dashboard: build `columns` (label + a
 * TYPED accessor + a `format`), map records → TableRow[] carrying the REAL
 * record as `data`, open a <RecordOverlay> on row click, tint rows via
 * `toneForRow`, select rows for a bulk write (`selectable` + `toolbarEnd`),
 * and escape the format enum with a `renderCell` when a cell needs its own
 * control. Copy a block, swap the field names, ship.
 *
 * The one rule that bites: an accessor returns the RAW value, never a formatted
 * string — sort/search/filter/aggregate read it. A currency column returns the
 * NUMBER and sets `format: 'currency'`; it renders "1.234,00 €" but still sorts
 * numerically. (Living Apps has no currency type — the agent chooses 'currency'
 * where the number is money; a plain amount stays 'number'.)
 *
 * Between 480px and full width the widget auto-sheds low-priority columns so the
 * important ones fit without horizontal scroll — the full record is always in the
 * RecordOverlay. Bump `priority` (or `responsive:'keep'`, shown on Status below)
 * to pin one, or pass `responsiveColumns={false}` to keep the plain scroll table.
 *
 * Every import resolves; every enum value is real; the row id is a template
 * literal read back with `id.split(':')` (the family convention).
 */
import { useEffect, useMemo, useState } from 'react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Buchung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { lookupKey } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  RecordOverlay,
  RecordHeader,
  RecordSection,
  RecordField,
  RecordAttachments,
  useRecordOverlayStack,
} from './RecordView';
import {
  TableWidget,
  TableSkeleton,
  TableError,
  type TableColumn,
  type TableRow,
  type TableTone,
} from './TableWidget';

const ROW_PREFIX = 'buchung';
function buchungIdOf(row: TableRow<Buchung>): string {
  return row.id.split(':')[1] ?? '';
}

// tone is a CLOSED enum (TableTone) — map workflow semantics, not decoration.
function toneForStatus(status: string | undefined): TableTone {
  if (status === 'eingecheckt') return 'success';
  if (status === 'bestaetigt') return 'primary';
  if (status === 'abgereist') return 'default';
  return 'warning'; // angefragt / unbearbeitet → needs attention
}

export function HotelTableExample() {
  const [buchungen, setBuchungen] = useState<Buchung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Controlled selection: the consumer owns the Set so a bulk write can CLEAR it.
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const overlay = useRecordOverlayStack<{ type: string; id: string }>();

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      setBuchungen(await LivingAppsService.getBuchung());
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []);

  // A cell-level write: confirm a requested booking straight from the table.
  // The row's detail stays onRowClick — this is a QUICK action, not a detail layer.
  const confirmBooking = async (id: string) => {
    await LivingAppsService.updateBuchungEntry(id, { status: 'bestaetigt' });
    void reload();
  };

  // The §7 bulk pattern: widget owns ONLY the Set; the bar composes via toolbarEnd.
  const bulkCheckIn = async () => {
    await Promise.all(Array.from(selected, id =>
      LivingAppsService.updateBuchungEntry(id.split(':')[1] ?? '', { status: 'eingecheckt' })));
    setSelected(new Set());
    void reload();
  };

  // Columns: the LABEL is localized by the consumer; the ACCESSOR reads the typed
  // record (tsc checks `r.data.fields.<x>`); `format` decides ONLY rendering. The
  // first text column becomes the card title on narrow screens (or mark it).
  const columns = useMemo<TableColumn<Buchung>[]>(() => [
    { key: 'gast', label: 'Gast', accessor: r => r.data.fields.gast, cardRole: 'title' },
    { key: 'anreise', label: 'Anreise', accessor: r => r.data.fields.anreise, format: 'date', filterable: true },
    // RAW NUMBER in the accessor, never a formatted string — sort/filter/aggregate
    // read it; `format: 'currency'` renders "120,00 €" but the column still sorts
    // numerically. `aggregate: 'sum'` totals the CURRENT filtered view in a footer.
    { key: 'preis', label: 'Preis', accessor: r => r.data.fields.preis, format: 'currency', aggregate: 'sum' },
    // `responsive: 'keep'` pins Status so responsive shedding never drops it on a
    // narrow container (or use `priority: 100`). The renderCell is the Tier-1
    // escape hatch: pill + a quick-confirm button IN the cell. `ctx.stopRowClick()`
    // keeps the button click from ALSO opening the row overlay (clicks on
    // button/a/input are auto-suppressed too — calling it is belt and braces).
    {
      key: 'status', label: 'Status', accessor: r => r.data.fields.status,
      format: 'pill', responsive: 'keep',
      renderCell: (value, row, ctx) => (
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center bg-secondary border border-[#bfdbfe] text-[#2563eb] rounded-[10px] px-2 py-1 text-sm font-medium">
            {(value as { label?: string } | undefined)?.label ?? '—'}
          </span>
          {lookupKey(row.data.fields.status) === 'angefragt' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { ctx.stopRowClick(); void confirmBooking(buchungIdOf(row)); }}
            >
              Bestätigen
            </Button>
          )}
        </span>
      ),
    },
  ], []);

  // Records → the widget's lean, TYPED row shape: `data` is the REAL record, so
  // the column accessors above are tsc-checked. Field names live in the columns
  // (the consumer), never in the widget.
  const rows = useMemo<TableRow<Buchung>[]>(
    () => buchungen.map(b => ({ id: `${ROW_PREFIX}:${b.record_id}`, data: b })),
    [buchungen],
  );

  if (loading) return <TableSkeleton columns={4} />;
  if (error) return <TableError error={error} onRetry={() => void reload()} />;

  const current = overlay.top ? buchungen.find(b => b.record_id === overlay.top!.id) : undefined;

  return (
    <>
      <TableWidget
        columns={columns}
        rows={rows}
        initialSort={{ key: 'anreise', dir: 'asc' }}
        searchPlaceholder="Buchung suchen …"
        exportable
        // Selection: the widget renders checkboxes + select-all and owns the Set —
        // departed bookings are locked out of it. EVERY bulk button lives in
        // toolbarEnd (the widget never learns what "einchecken" means).
        selectable
        isRowSelectable={row => lookupKey(row.data.fields.status) !== 'abgereist'}
        selectedIds={selected}
        onSelectionChange={setSelected}
        toolbarEnd={selected.size > 0 ? (
          <Button size="sm" onClick={() => void bulkCheckIn()}>
            {selected.size} einchecken
          </Button>
        ) : null}
        // Tone by closure — overdue/active rows read louder. `row.tone` on the
        // row shape works too; this closure just keeps it out of the mapping.
        toneForRow={row => toneForStatus(lookupKey(row.data.fields.status))}
        // A clicked row opens a <RecordOverlay> — the table owns no detail layer.
        onRowClick={row => overlay.replace({ type: ROW_PREFIX, id: buchungIdOf(row) })}
      />

      <RecordOverlay open={overlay.open} onClose={overlay.close} ariaLabel="Buchung">
        {current && (
          <>
            <RecordHeader
              title={current.fields.gast ?? 'Ohne Gast'}
              subtitle={current.fields.status?.label}
            />
            <RecordSection title="Details" cols={2}>
              <RecordField label="Anreise" value={current.fields.anreise} format="date" />
              <RecordField label="Preis" value={current.fields.preis} format="currency" />
              <RecordField label="Status" value={current.fields.status} format="pill" />
            </RecordSection>
            <RecordAttachments appId={APP_IDS.BUCHUNG} recordId={current.record_id} />
          </>
        )}
      </RecordOverlay>
    </>
  );
}
