export type MasterFieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "file"
  | "toggle"
  | "checkbox";

export type MasterFieldValue = string | boolean | Date | null;

export interface MasterColumn {
  key: string;
  label: string;
}

export interface MasterFilterDefinition {
  key: string;
  label: string;
  options: string[];
}

export interface MasterFieldDefinition {
  key: string;
  label: string;
  type: MasterFieldType;
  helperText?: string;
  options?: string[];
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  span?: "single" | "full";
}

export interface MasterRecord {
  id: string;
  [key: string]: string | boolean | Date | null | undefined;
}

export interface MasterDefinition {
  slug: string;
  title: string;
  gridColumns: 3 | 4 | 5;
  columns: MasterColumn[];
  filters: MasterFilterDefinition[];
  fields: MasterFieldDefinition[];
  rows: MasterRecord[];
}
