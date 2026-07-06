import { useMemo, useState, useCallback } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { Mitarbeiterverzeichnis } from '@/types/app';
import { APP_IDS, LOOKUP_OPTIONS } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { lookupKey } from '@/lib/formatters';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { AI_PHOTO_SCAN } from '@/config/ai-features';
import { DashboardGrid } from '@/components/DashboardGrid';
import { WorkList } from '@/components/WorkList';
import { StatCard } from '@/components/StatCard';
import { StatCardRow } from '@/components/StatCard';
import { MitarbeiterverzeichnisDialog } from '@/components/dialogs/MitarbeiterverzeichnisDialog';
import {
  RecordOverlay,
  RecordHeader,
  RecordSection,
  RecordField,
  RecordAttachments,
  useRecordOverlayStack,
} from '@/components/widgets/RecordView';
import {
  TableWidget,
  TableSkeleton,
  TableError,
  TableEmpty,
  type TableColumn,
  type TableRow,
  type TableTone,
} from '@/components/widgets/TableWidget';
import {
  IconUsers,
  IconBuilding,
  IconPhone,
  IconMail,
  IconPencil,
  IconTrash,
  IconPlus,
  IconAlertCircle,
  IconTool,
  IconRefresh,
  IconCheck,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const APPGROUP_ID = '6a47827fb5e66fdf54c16fb4';
const REPAIR_ENDPOINT = '/claude/build/repair';
const ROW_PREFIX = 'mitarbeiter';
const ABTEILUNG_OPTIONS = LOOKUP_OPTIONS['mitarbeiterverzeichnis']?.['abteilung'] ?? [];

type MaRow = TableRow<Mitarbeiterverzeichnis>;

function idOf(row: MaRow): string {
  return row.id.split(':')[1] ?? '';
}

function toneForRow(row: MaRow): TableTone {
  return row.data.fields.email ? 'default' : 'warning';
}

export default function DashboardOverview() {
  const {
    mitarbeiterverzeichnis,
    setMitarbeiterverzeichnis,
    loading, error, fetchAll,
  } = useDashboardData();

  const clock = useClock();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Mitarbeiterverzeichnis | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Mitarbeiterverzeichnis | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk abteilung-assign state
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [bulkAbteilung, setBulkAbteilung] = useState<string>('');
  const [bulkSaving, setBulkSaving] = useState(false);

  // Overlay
  const overlay = useRecordOverlayStack<{ type: string; id: string }>();

  // KPI filter
  const [abteilungFilter, setAbteilungFilter] = useState<string | null>(null);

  // KPI data
  const mitOhneEmail = useMemo(
    () => mitarbeiterverzeichnis.filter(m => !m.fields.email),
    [mitarbeiterverzeichnis],
  );
  const mitOhneTelefon = useMemo(
    () => mitarbeiterverzeichnis.filter(m => !m.fields.telefon),
    [mitarbeiterverzeichnis],
  );

  // Department breakdown
  const abteilungCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of mitarbeiterverzeichnis) {
      const key = lookupKey(m.fields.abteilung) ?? 'sonstige';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [mitarbeiterverzeichnis]);

  const topAbteilung = useMemo(() => {
    let best = { key: '', label: '', count: 0 };
    for (const opt of ABTEILUNG_OPTIONS) {
      const c = abteilungCounts[opt.key] ?? 0;
      if (c > best.count) best = { key: opt.key, label: opt.label, count: c };
    }
    return best;
  }, [abteilungCounts]);

  // Rows
  const rows = useMemo<MaRow[]>(
    () => mitarbeiterverzeichnis.map(m => ({
      id: `${ROW_PREFIX}:${m.record_id}`,
      data: m,
    })),
    [mitarbeiterverzeichnis],
  );

  // Recently added (last 5, sorted by createdat desc)
  const recentlyAdded = useMemo(
    () => [...mitarbeiterverzeichnis]
      .sort((a, b) => (b.createdat ?? '').localeCompare(a.createdat ?? ''))
      .slice(0, 5),
    [mitarbeiterverzeichnis],
  );

  // Columns
  const columns = useMemo<TableColumn<Mitarbeiterverzeichnis>[]>(() => [
    {
      key: 'name',
      label: 'Name',
      accessor: r => `${r.data.fields.nachname ?? ''}, ${r.data.fields.vorname ?? ''}`,
      cardRole: 'title',
      priority: 100,
    },
    {
      key: 'personalnummer',
      label: 'Pers.-Nr.',
      accessor: r => r.data.fields.personalnummer,
      priority: 80,
    },
    {
      key: 'abteilung',
      label: 'Abteilung',
      accessor: r => r.data.fields.abteilung,
      format: 'pill',
      filterable: true,
      priority: 90,
    },
    {
      key: 'telefon',
      label: 'Telefon',
      accessor: r => r.data.fields.telefon,
      renderCell: (value) => value ? (
        <a
          href={`tel:${value}`}
          className="text-primary hover:underline"
          onClick={e => e.stopPropagation()}
        >
          {String(value)}
        </a>
      ) : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'email',
      label: 'E-Mail',
      accessor: r => r.data.fields.email,
      format: 'email',
      renderCell: (value) => value ? (
        <a
          href={`mailto:${value}`}
          className="text-primary hover:underline truncate block max-w-[200px]"
          onClick={e => e.stopPropagation()}
        >
          {String(value)}
        </a>
      ) : <span className="text-muted-foreground">—</span>,
    },
  ], []);

  // Handlers
  const handleEdit = useCallback((m: Mitarbeiterverzeichnis) => {
    setEditRecord(m);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (m: Mitarbeiterverzeichnis) => {
    setDeleting(true);
    const snapshot = [...mitarbeiterverzeichnis];
    // Optimistic
    setMitarbeiterverzeichnis(prev => prev.filter(x => x.record_id !== m.record_id));
    try {
      await LivingAppsService.deleteMitarbeiterverzeichni(m.record_id);
      undoToast(
        `${m.fields.vorname ?? ''} ${m.fields.nachname ?? ''} gelöscht`,
        async () => {
          await LivingAppsService.createMitarbeiterverzeichni(m.fields as any);
          fetchAll();
        },
      );
    } catch {
      setMitarbeiterverzeichnis(snapshot);
      fetchAll();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [mitarbeiterverzeichnis, setMitarbeiterverzeichnis, fetchAll]);

  const handleBulkAbteilung = useCallback(async () => {
    if (!bulkAbteilung || selected.size === 0) return;
    setBulkSaving(true);
    const ids = Array.from(selected).map(s => s.split(':')[1] ?? '');
    const snapshot = [...mitarbeiterverzeichnis];
    // Optimistic update
    setMitarbeiterverzeichnis(prev =>
      prev.map(m =>
        ids.includes(m.record_id)
          ? {
              ...m,
              fields: {
                ...m.fields,
                abteilung: ABTEILUNG_OPTIONS.find(o => o.key === bulkAbteilung) ?? m.fields.abteilung,
              },
            }
          : m,
      ),
    );
    try {
      await Promise.all(ids.map(id =>
        LivingAppsService.updateMitarbeiterverzeichni(id, { abteilung: bulkAbteilung }),
      ));
      const abtLabel = ABTEILUNG_OPTIONS.find(o => o.key === bulkAbteilung)?.label ?? bulkAbteilung;
      undoToast(
        `${ids.length} Mitarbeiter → ${abtLabel}`,
        async () => {
          setMitarbeiterverzeichnis(snapshot);
          await Promise.all(
            snapshot
              .filter(m => ids.includes(m.record_id))
              .map(m =>
                LivingAppsService.updateMitarbeiterverzeichni(m.record_id, {
                  abteilung: lookupKey(m.fields.abteilung),
                }),
              ),
          );
        },
      );
      setSelected(new Set());
      setBulkAbteilung('');
    } catch {
      setMitarbeiterverzeichnis(snapshot);
      fetchAll();
    } finally {
      setBulkSaving(false);
    }
  }, [bulkAbteilung, selected, mitarbeiterverzeichnis, setMitarbeiterverzeichnis, fetchAll]);

  // Context line
  const contextLine = useMemo(() => {
    const total = mitarbeiterverzeichnis.length;
    if (total === 0) return 'Noch keine Mitarbeiter erfasst – leg jetzt den ersten an.';
    const names = recentlyAdded.slice(0, 2).map(m =>
      [m.fields.vorname, m.fields.nachname].filter(Boolean).join(' '),
    );
    const nameStr = namen(names);
    return `${total} Mitarbeiter${topAbteilung.count > 0 ? ` · stärkste Abteilung: ${topAbteilung.label} (${topAbteilung.count})` : ''} · zuletzt hinzugefügt: ${nameStr}.`;
  }, [mitarbeiterverzeichnis, recentlyAdded, topAbteilung]);

  // Overlay record
  const overlayRecord = useMemo(
    () => overlay.top ? mitarbeiterverzeichnis.find(m => m.record_id === overlay.top!.id) : undefined,
    [overlay.top, mitarbeiterverzeichnis],
  );

  // Filtered rows for the table (KPI filter)
  const filteredRows = useMemo(() => {
    if (!abteilungFilter) return rows;
    return rows.filter(r => lookupKey(r.data.fields.abteilung) === abteilungFilter);
  }, [rows, abteilungFilter]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  const bulkBar = selected.size > 0 ? (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">
        {selected.size} ausgewählt:
      </span>
      <Select value={bulkAbteilung} onValueChange={setBulkAbteilung}>
        <SelectTrigger className="h-8 w-44 text-sm">
          <SelectValue placeholder="Abteilung wählen …" />
        </SelectTrigger>
        <SelectContent>
          {ABTEILUNG_OPTIONS.map(opt => (
            <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        disabled={!bulkAbteilung || bulkSaving}
        onClick={() => void handleBulkAbteilung()}
      >
        {bulkSaving ? 'Speichern …' : 'Zuweisen'}
      </Button>
    </div>
  ) : null;

  return (
    <>
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{gruss(clock)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{contextLine}</p>
        </div>
        <Button
          className="mt-3 sm:mt-0 shrink-0"
          onClick={() => { setEditRecord(null); setDialogOpen(true); }}
        >
          <IconPlus size={16} className="mr-1.5 shrink-0" />
          Mitarbeiter anlegen
        </Button>
      </div>

      <DashboardGrid
        variant="wide"
        kpis={
          <StatCardRow>
            <StatCard
              title="Mitarbeiter gesamt"
              value={mitarbeiterverzeichnis.length}
              description={topAbteilung.count > 0 ? `Größte Abteilung: ${topAbteilung.label}` : 'Noch keine Abteilungen'}
              icon={<IconUsers size={18} className="text-muted-foreground" />}
              tone="default"
            />
            <StatCard
              title="Ohne E-Mail"
              value={mitOhneEmail.length}
              description={mitOhneEmail.length > 0 ? 'Bitte E-Mail nachtragen' : 'Alle vollständig'}
              icon={<IconMail size={18} className="text-muted-foreground" />}
              tone={mitOhneEmail.length > 0 ? 'warning' : 'default'}
              onClick={() => setAbteilungFilter(f => f === '__email__' ? null : '__email__')}
              active={abteilungFilter === '__email__'}
            />
            <StatCard
              title="Ohne Telefon"
              value={mitOhneTelefon.length}
              description={mitOhneTelefon.length > 0 ? 'Bitte Telefon nachtragen' : 'Alle vollständig'}
              icon={<IconPhone size={18} className="text-muted-foreground" />}
              tone={mitOhneTelefon.length > 0 ? 'warning' : 'default'}
              onClick={() => setAbteilungFilter(f => f === '__phone__' ? null : '__phone__')}
              active={abteilungFilter === '__phone__'}
            />
            <StatCard
              title="Abteilungen"
              value={Object.keys(abteilungCounts).length}
              description="Belegte Abteilungen"
              icon={<IconBuilding size={18} className="text-muted-foreground" />}
              tone="default"
            />
          </StatCardRow>
        }
        aside={
          <WorkList
            title="Zuletzt hinzugefügt"
            icon={<IconUsers size={14} />}
            items={recentlyAdded.map(m => ({
              id: m.record_id,
              title: `${m.fields.vorname ?? ''} ${m.fields.nachname ?? ''}`.trim() || 'Unbekannt',
              secondLine: (
                <>
                  <span className="text-muted-foreground">
                    {m.fields.abteilung?.label ?? '—'}
                  </span>
                  {m.fields.personalnummer && (
                    <span className="text-muted-foreground"> · {m.fields.personalnummer}</span>
                  )}
                </>
              ),
              action: {
                label: 'Bearbeiten',
                onClick: () => handleEdit(m),
              },
            }))}
            onItemClick={id => overlay.replace({ type: ROW_PREFIX, id })}
            empty={{
              text: 'Noch keine Mitarbeiter erfasst.',
              action: {
                label: 'Ersten Mitarbeiter anlegen',
                onClick: () => { setEditRecord(null); setDialogOpen(true); },
              },
            }}
          />
        }
        primary={
          (() => {
            // Compute effective rows based on filter
            let effectiveRows = rows;
            if (abteilungFilter === '__email__') {
              effectiveRows = rows.filter(r => !r.data.fields.email);
            } else if (abteilungFilter === '__phone__') {
              effectiveRows = rows.filter(r => !r.data.fields.telefon);
            } else if (abteilungFilter) {
              effectiveRows = filteredRows;
            }

            if (effectiveRows.length === 0 && mitarbeiterverzeichnis.length === 0) {
              return (
                <TableEmpty
                  title="Noch keine Mitarbeiter"
                  description="Leg den ersten Mitarbeiter an, um das Verzeichnis zu befüllen."
                  action={
                    <Button onClick={() => { setEditRecord(null); setDialogOpen(true); }}>
                      <IconPlus size={16} className="mr-1.5" />
                      Ersten Mitarbeiter anlegen
                    </Button>
                  }
                />
              );
            }

            return (
              <TableWidget
                columns={columns}
                rows={effectiveRows}
                locale="de"
                searchPlaceholder="Name, Personalnummer, Abteilung …"
                exportable
                selectable
                selectedIds={selected}
                onSelectionChange={setSelected}
                toneForRow={toneForRow}
                toolbarEnd={bulkBar}
                actions={[
                  {
                    icon: IconPencil,
                    label: 'Bearbeiten',
                    onClick: row => handleEdit(row.data),
                  },
                  {
                    icon: IconTrash,
                    label: 'Löschen',
                    tone: 'destructive',
                    onClick: row => setDeleteTarget(row.data),
                  },
                ]}
                onRowClick={row => overlay.replace({ type: ROW_PREFIX, id: idOf(row) })}
              />
            );
          })()
        }
      />

      {/* Create / Edit dialog */}
      <MitarbeiterverzeichnisDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditRecord(null); }}
        onSubmit={async fields => {
          if (editRecord) {
            await LivingAppsService.updateMitarbeiterverzeichni(editRecord.record_id, fields as any);
          } else {
            await LivingAppsService.createMitarbeiterverzeichni(fields as any);
          }
          fetchAll();
        }}
        defaultValues={editRecord?.fields}
        recordId={editRecord?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Mitarbeiterverzeichnis']}
      />

      {/* Delete confirm */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Mitarbeiter löschen"
        >
          <div className="bg-card rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <IconTrash size={18} className="text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Mitarbeiter löschen</h3>
                <p className="text-sm text-muted-foreground">
                  {deleteTarget.fields.vorname} {deleteTarget.fields.nachname} wirklich löschen?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Abbrechen
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleting}
                onClick={() => void handleDelete(deleteTarget)}
              >
                {deleting ? 'Löschen …' : 'Löschen'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record overlay */}
      <RecordOverlay
        open={overlay.open}
        onClose={overlay.close}
        ariaLabel="Mitarbeiter"
        onEdit={overlayRecord ? () => { overlay.close(); handleEdit(overlayRecord); } : undefined}
      >
        {overlayRecord && (
          <>
            <RecordHeader
              title={`${overlayRecord.fields.vorname ?? ''} ${overlayRecord.fields.nachname ?? ''}`.trim()}
              subtitle={overlayRecord.fields.abteilung?.label}
            />
            <RecordSection title="Kontakt" cols={2}>
              <RecordField label="Personalnummer" value={overlayRecord.fields.personalnummer} />
              <RecordField label="Abteilung" value={overlayRecord.fields.abteilung} format="pill" />
              <RecordField label="Telefon" value={overlayRecord.fields.telefon}>
                {overlayRecord.fields.telefon ? (
                  <a
                    href={`tel:${overlayRecord.fields.telefon}`}
                    className="text-primary hover:underline text-sm"
                  >
                    {overlayRecord.fields.telefon}
                  </a>
                ) : null}
              </RecordField>
              <RecordField label="E-Mail" value={overlayRecord.fields.email}>
                {overlayRecord.fields.email ? (
                  <a
                    href={`mailto:${overlayRecord.fields.email}`}
                    className="text-primary hover:underline text-sm truncate block"
                  >
                    {overlayRecord.fields.email}
                  </a>
                ) : null}
              </RecordField>
            </RecordSection>
            <RecordAttachments appId={APP_IDS.MITARBEITERVERZEICHNIS} recordId={overlayRecord.record_id} />
          </>
        )}
      </RecordOverlay>
    </>
  );
}

// ─── Skeleton & Error ────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const [repairing, setRepairing] = useState(false);
  const [repairStatus, setRepairStatus] = useState('');
  const [repairDone, setRepairDone] = useState(false);
  const [repairFailed, setRepairFailed] = useState(false);

  const handleRepair = async () => {
    setRepairing(true);
    setRepairStatus('Reparatur wird gestartet...');
    setRepairFailed(false);
    const errorContext = JSON.stringify({
      type: 'data_loading',
      message: error.message,
      stack: (error.stack ?? '').split('\n').slice(0, 10).join('\n'),
      url: window.location.href,
    });
    try {
      const resp = await fetch(REPAIR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appgroup_id: APPGROUP_ID, error_context: errorContext }),
      });
      if (!resp.ok || !resp.body) { setRepairing(false); setRepairFailed(true); return; }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data: ')) continue;
          const content = line.slice(6);
          if (content.startsWith('[STATUS]')) setRepairStatus(content.replace(/^\[STATUS]\s*/, ''));
          if (content.startsWith('[DONE]')) { setRepairDone(true); setRepairing(false); }
          if (content.startsWith('[ERROR]') && !content.includes('Dashboard-Links')) setRepairFailed(true);
        }
      }
    } catch { setRepairing(false); setRepairFailed(true); }
  };

  if (repairDone) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <IconCheck size={22} className="text-green-500" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-1">Dashboard repariert</h3>
          <p className="text-sm text-muted-foreground max-w-xs">Das Problem wurde behoben. Bitte laden Sie die Seite neu.</p>
        </div>
        <Button size="sm" onClick={() => window.location.reload()}>
          <IconRefresh size={14} className="mr-1" />Neu laden
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <IconAlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {repairing ? repairStatus : error.message}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRetry} disabled={repairing}>Erneut versuchen</Button>
        <Button size="sm" onClick={handleRepair} disabled={repairing}>
          {repairing
            ? <span className="inline-block w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1" />
            : <IconTool size={14} className="mr-1" />}
          {repairing ? 'Reparatur läuft...' : 'Dashboard reparieren'}
        </Button>
      </div>
      {repairFailed && <p className="text-sm text-destructive">Automatische Reparatur fehlgeschlagen. Bitte kontaktieren Sie den Support.</p>}
    </div>
  );
}
