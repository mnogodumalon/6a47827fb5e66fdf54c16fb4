---
name: intent-ui
description: |
  Activate this skill when:
  - Building an intent-specific UI page (src/pages/intents/*.tsx)
  - Creating multi-step task workflows that span multiple entities
  - Building wizard/stepper interfaces for complex user tasks
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Intent UI Building Skill

Build a **multi-step task workflow** — NOT a CRUD page with different styling.

---

## What Makes an Intent UI (vs a CRUD page)

Every entity already has a CRUD page. An intent UI is fundamentally different:

| CRUD Page (already exists) | Intent UI (what you build) |
|---|---|
| Shows ONE entity's records | Orchestrates MULTIPLE entities in one flow |
| Generic table + search + dialogs | Task-specific steps with clear progression |
| Creates one record at a time | Often creates MANY records in one flow |
| No context between actions | Live feedback: totals, counts, progress |
| No clear start/end | Wizard with start → steps → completion |

**If your intent UI is just a table/list/kanban of ONE entity — you're building a CRUD page, not an intent UI. Stop and redesign.**

---

## Your Workflow

1. **Read `src/types/app.ts` FIRST** to learn the exact field names for each entity type. NEVER guess field names.
2. **Write the complete file** with `Write` tool — one shot, no read-back
3. Do NOT run `npm run build` — the orchestrator handles that

---

## Pre-Generated Shared Components (USE THESE — do NOT recreate!)

### IntentWizardShell — wizard container with all boilerplate
```tsx
import { IntentWizardShell } from '@/components/IntentWizardShell';

const [step, setStep] = useState(1);

<IntentWizardShell
  title="Event vorbereiten"
  subtitle="Schritt-für-Schritt zum perfekten Event"
  steps={[{label: 'Event'}, {label: 'Gäste'}, {label: 'Dienstleister'}, {label: 'Fertig'}]}
  currentStep={step}
  onStepChange={setStep}
  loading={loading}
  error={error}
  onRetry={fetchAll}
>
  {step === 1 && <EventSelect ... />}
  {step === 2 && <GuestInvite ... />}
  {step === 3 && <VendorBooking ... />}
  {step === 4 && <Summary ... />}
</IntentWizardShell>
```
Handles: step indicator circles, URL deep-linking (?step=N), loading/error states. Each step must provide its own action/navigation buttons (e.g., "Weiter zu Schritt 3", "Einladungen versenden").

### EntitySelectStep — reusable "pick an item" step WITH "create new" support
```tsx
import { EntitySelectStep } from '@/components/EntitySelectStep';

const [dialogOpen, setDialogOpen] = useState(false);

<EntitySelectStep
  items={events.map(e => ({
    id: e.record_id,
    title: e.fields.event_name ?? '',
    subtitle: `${formatDate(e.fields.event_datum)} · ${e.fields.event_location_name ?? ''}`,
    status: e.fields.event_status ? { key: e.fields.event_status.key, label: e.fields.event_status.label } : undefined,
    stats: [{ label: 'Gäste', value: guestCount }, { label: 'Budget', value: formatCurrency(e.fields.event_budget) }],
    icon: <IconCalendarEvent size={20} className="text-primary" />,
  }))}
  onSelect={(id) => { setSelectedEventId(id); setStep(2); }}
  createLabel="Neues Event"
  onCreateNew={() => setDialogOpen(true)}
  createDialog={
    <EventDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      onSubmit={async (fields) => {
        await LivingAppsService.createEventEntry(fields);
        await fetchAll();
        setDialogOpen(false);
      }}
      enablePhotoScan={AI_PHOTO_SCAN['Event']}
    />
  }
/>
```
Provides: search input, card list with title/subtitle/status/stats, click-to-select, **"Neu erstellen" button + dialog slot**.

Props:
- `items` — array of {id, title, subtitle?, status?, stats?, icon?}
- `onSelect` — called when user picks an existing item
- `createLabel` — optional label for the "create new" button (default: "Neu erstellen")
- `onCreateNew` — optional callback to open the {Entity}Dialog
- `createDialog` — optional ReactNode for the dialog component (rendered alongside the list)

### BudgetTracker — budget progress widget
```tsx
import { BudgetTracker } from '@/components/BudgetTracker';

<BudgetTracker budget={event.fields.event_budget ?? 0} booked={totalBookedCost} />
```
Shows: progress bar (green/yellow/red), formatted currency, remaining amount.

### StatusBadge — universal status badge
```tsx
import { StatusBadge } from '@/components/StatusBadge';

<StatusBadge statusKey={record.fields.rsvp_status?.key} label={record.fields.rsvp_status?.label} />
```
Maps ALL common status keys (event/rsvp/booking/payment) to appropriate colors automatically.

---

## Custom Step Content

With the shared components above, you only need to write the **custom step content** — typically 200-300 lines instead of 800+. Each step is just a div inside IntentWizardShell's children.

---

## Pattern: Record Selection + Creation (MANDATORY for every selection step)

When a step requires the user to pick a record, ALWAYS use EntitySelectStep with the built-in create support:

```tsx
const [dialogOpen, setDialogOpen] = useState(false);

<EntitySelectStep
  items={gaeste.map(g => ({ id: g.record_id, title: g.fields.name ?? '', ... }))}
  onSelect={(id) => { setSelectedGuestId(id); setStep(3); }}
  createLabel="Neuen Gast anlegen"
  onCreateNew={() => setDialogOpen(true)}
  createDialog={
    <GaesteDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      onSubmit={async (fields) => {
        await LivingAppsService.createGaesteEntry(fields);
        await fetchAll();
        setDialogOpen(false);
      }}
    />
  }
/>
```

The "Neu erstellen" button appears next to the search bar AND in the empty state.

---

## CRITICAL: NEVER use the pre-generated `{Entity}Dialog` inside an intent UI

This is the single biggest mistake. The `{Entity}Dialog` components (KundenDialog,
KatzenDialog, BuchungenDialog, …) are the generic CRUD forms. They show **every**
field, in the same modal, for every situation. That is the opposite of what an
intent UI is.

An intent UI must give the user, **at each step**, only the information that
matters for that specific decision, and the most ergonomic way to enter what's
needed. Re-using the generic CRUD dialog defeats the entire purpose of the wizard.

❌ DON'T (re-using the CRUD dialog for the "Neu erstellen" slot):
```tsx
<EntitySelectStep
  ...
  createDialog={<KundenDialog open={...} onSubmit={...} />}
/>
```
Result: the user gets the full Kunden form (vorname, nachname, telefon, email,
strasse, hausnummer, plz, ort, … plus photo-scan UI) in a modal — even when only
"first name + last name + phone" is relevant for a quick walk-in registration.

❌ DON'T (using the CRUD dialog as the main step):
```tsx
{step === 3 && <BuchungenDialog open onSubmit={handleSubmit} ... />}
```
Result: a 10-field generic modal pops over the wizard, shows fields already
captured in earlier steps, breaks the flow, and forces the user to deal with a
form designed for a totally different context.

✅ DO (build a task-tailored inline UI per step):
- Step "Pick a Kunde": search + list, plus an **inline mini-form** with only the
  3–4 fields needed for a fast registration (e.g. vorname + nachname + telefon).
  No modal, no photo-scan UI, no address fields — those can be filled later from
  the CRUD page if ever needed.
- Step "Pick a Katze for this Kunde": list filtered to that Kunde's cats, plus
  inline form with only katzenname + impfstatus + besitzer (auto-filled).
- Step "Buchungsdetails": custom inline form with a beautiful date-range picker,
  a tile-style multi-select for Zusatzleistungen with prices, a live-updating
  total card. NOT a 10-field modal.

The wizard owns the UI for each step. It calls `LivingAppsService.create…Entry()`
directly. The user gets a UX designed for *their current task*, not the generic
"edit any field of this record" CRUD experience.

---

## Pattern: Bulk Record Creation

When the user needs to create many records (e.g., invite 20 guests):

```tsx
const handleInvite = async (guestId: string) => {
  await LivingAppsService.createEinladungenEntry({
    veranstaltung: createRecordUrl(APP_IDS.VERANSTALTUNGEN, selectedEvent!),
    gast: createRecordUrl(APP_IDS.GAESTE, guestId),
    status: { key: 'eingeladen', label: 'Eingeladen' },
  });
  setInvitedGuests(prev => [...prev, guestId]);
  fetchAll(); // refresh data
};
```

**Show live feedback:**
- Counter: "12 von 40 Gästen eingeladen"
- Progress bar
- Running cost total if budget-relevant

---

## Pattern: Cross-Entity Selection

When the user picks from multiple entities to create a linked record:

```tsx
// Step 1: Select student (from Fahrschueler)
// Step 2: Select instructor (from Fahrlehrer, filtered by availability)
// Step 3: Select vehicle (from Fahrzeuge, filtered by type matching class)
// Step 4: Pick date/time
// Step 5: Confirm → creates Fahrstunde with all 3 applookup references
```

Each step narrows the options based on previous selections.

---

## Anti-Patterns (DO NOT BUILD)

- ❌ **Status kanban** for one entity → belongs on the dashboard, not an intent page
- ❌ **Filtered table** of one entity → that's the CRUD page
- ❌ **Single-entity form** with styling → that's the existing dialog
- ❌ **Read-only summary/stats** → belongs on the dashboard
- ❌ **Entity list with action buttons** → that's the CRUD page with extra buttons

---

## CRITICAL: Never link the user from an intent UI to a CRUD subpage

The CRUD subpages (`#/buchungen`, `#/kunden`, `#/katzen`, …) are generic admin
tables and do NOT belong in the intent flow. Linking the user there mid-task or
on success drops them into a different mental context, away from the focused
workflow they just completed.

Allowed link targets from inside an intent UI:
- `#/` — the dashboard (the natural "home base" after a completed task)
- `#/intents/<other-slug>` — a follow-up intent that continues the task

❌ DON'T:
```tsx
<a href="#/buchungen">Zur Buchungsübersicht</a>
<Button onClick={() => { window.location.hash = '/kunden'; }}>Zur Kundenliste</Button>
```

✅ DO:
```tsx
// Success state — return to dashboard or chain to a follow-up intent
<Button onClick={handleReset}>Neue Buchung anlegen</Button>      // reset wizard
<a href="#/">Zurück zum Dashboard</a>                            // home base
<a href="#/intents/abreise-abwickeln">Weiter: Abreise abwickeln</a>  // chain
```

The dashboard is responsible for navigation to any CRUD page if the user needs it.
The intent UI is responsible for finishing the task and returning the user to
either a clean slate (new task) or the dashboard (overview).

---

## Technical Rules

These are MANDATORY — violation causes TypeScript build errors or runtime crashes:

- **Rules of Hooks**: ALL hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) MUST be placed BEFORE any early returns (`if (loading) return`, `if (error) return`)
- **Import hygiene**: Only import what you actually use.
- **Reuse Entity Dialogs**: For creating a single record within a step, import pre-generated `{Entity}Dialog` from `@/components/dialogs/{Entity}Dialog`. The dialog handles all field types, validation, photo scan.
- **No Bash file ops**: Use Read/Write/Edit tools only
- **No file read-back**: After Write, do NOT read the file back
- **Touch-friendly**: Never hide buttons behind hover

## Available Libraries

- **shadcn/ui**: Button, Card, Badge, Dialog, Select, Input, Tabs, Table (all in `src/components/ui/`)
- **@tabler/icons-react**: All icons prefixed with `Icon`. Use `stroke` prop, not `strokeWidth`.
- **date-fns**: `format`, `parseISO`, `isAfter`, `isBefore`, `addDays`, `differenceInDays`. Import `de` locale.

## Data Access

From `useDashboardData()` hook:
- Entity records: `Record<string, EntityType>` — use `Object.values()` to get array
- Map objects: `{entity}Map` for applookup resolution
- `fetchAll()` — refetch after creating/updating records
- `loading`, `error` — handle in the component

**CRUD operations — use ONLY pre-generated service methods with EXACT field names from src/types/app.ts:**
```typescript
await LivingAppsService.createXEntry(fields);  // fields must match the type definition exactly
await LivingAppsService.updateXEntry(recordId, fields);
await LivingAppsService.deleteXEntry(recordId);
```
Do NOT create custom service functions. Do NOT invent field names — read them from the types.

### CRITICAL: Lookup field values when writing to the API

When READING, lookup fields are enriched objects: `{ key: 'gut', label: 'Gut' }`.
When WRITING (create/update), the API expects **ONLY the plain key string**, NOT the object!

```typescript
// ❌ WRONG — API returns 400 "illegal-field-value"
await LivingAppsService.createEinladungenEntry({
  status: { key: 'eingeladen', label: 'Eingeladen' },  // dict → error!
});

// ✅ CORRECT — send plain key string
await LivingAppsService.createEinladungenEntry({
  status: 'eingeladen',  // just the key
});
```

This applies to ALL lookup/select, lookup/radio, and multiplelookup fields.
For multiplelookup, send an array of key strings: `['tag1', 'tag2']`, NOT `[{key, label}, ...]`.

The pre-generated {Entity}Dialog handles this automatically — but when you create records
directly via LivingAppsService in intent UI code, YOU must send plain keys.

### CRITICAL: multipleapplookup field values when writing to the API

`multipleapplookup/*` fields (e.g. a booking's `extras` referencing many `Zusatzleistung`
records) expect either `null` or an **array of full record URLs** — `string[]`.
This is the single most common bug in intent UI code that selects multiple records
via tiles/chips/checkboxes and posts directly to the API. NEVER join, stringify, or
collapse the array into a single string.

```typescript
// Wizard state — typical pattern: Set<recordId> toggled by tile clicks
const [selected, setSelected] = useState<Set<string>>(new Set());

// On submit — map IDs to full record URLs, send the ARRAY directly
const urls = Array.from(selected).map(id => createRecordUrl(APP_IDS.ZUSATZLEISTUNGEN, id));

// ✅ CORRECT — string[] (or undefined when empty)
await LivingAppsService.createBuchungenEntry({
  extras: urls.length > 0 ? urls : undefined,
});

// ❌ WRONG — API returns 422 "type none or list expected, not str"
extras: urls.join(',')

// ❌ WRONG — single URL when the field expects a list
extras: createRecordUrl(APP_IDS.ZUSATZLEISTUNGEN, oneId)

// ❌ WRONG — JSON string instead of an actual array
extras: JSON.stringify(urls)
```

Rule of thumb: if the form-state is a `Set<id>` or `id[]`, map to URLs first, then pass
the ARRAY directly. Singular `applookup/select` → one URL string. Multiple
`multipleapplookup/*` → array of URL strings, always.

## Design Tokens

Use existing CSS custom properties — do NOT create new ones:
- `bg-card`, `bg-secondary`, `bg-primary`, `bg-destructive/10`
- `text-foreground`, `text-muted-foreground`, `text-primary-foreground`
- `rounded-2xl`, `shadow-lg` for card wrappers
