export interface CsvColumn<Row> {
  key: keyof Row & string;
  label: string;
}

export function exportRowsToCsv<Row extends Record<string, unknown>>(
  rows: readonly Row[],
  columns: readonly CsvColumn<Row>[],
  filename: string,
) {
  const header = columns.map((column) => escapeCsvValue(column.label));
  const lines = rows.map((row) =>
    columns
      .map((column) => escapeCsvValue(formatCsvValue(row[column.key])))
      .join(","),
  );
  const csvContent = [header.join(","), ...lines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function formatCsvValue(value: unknown) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null || typeof value === "undefined") {
    return "";
  }

  return String(value);
}

function escapeCsvValue(value: string) {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}
