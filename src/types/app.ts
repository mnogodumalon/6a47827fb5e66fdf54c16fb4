// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Mitarbeiterverzeichnis {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    vorname?: string;
    nachname?: string;
    personalnummer?: string;
    abteilung?: LookupValue;
    telefon?: string;
    email?: string;
  };
}

export const APP_IDS = {
  MITARBEITERVERZEICHNIS: '6a4782736e67a998c8af44c7',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'mitarbeiterverzeichnis': {
    abteilung: [{ key: "geschaeftsfuehrung", label: "Geschäftsführung" }, { key: "personal", label: "Personal" }, { key: "finanzen", label: "Finanzen" }, { key: "vertrieb", label: "Vertrieb" }, { key: "marketing", label: "Marketing" }, { key: "it", label: "IT" }, { key: "einkauf", label: "Einkauf" }, { key: "logistik", label: "Logistik" }, { key: "recht", label: "Recht" }, { key: "kundenservice", label: "Kundenservice" }, { key: "sonstige", label: "Sonstige" }],
  },
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'mitarbeiterverzeichnis': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'personalnummer': 'string/text',
    'abteilung': 'lookup/select',
    'telefon': 'string/tel',
    'email': 'string/email',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateMitarbeiterverzeichnis = StripLookup<Mitarbeiterverzeichnis['fields']>;