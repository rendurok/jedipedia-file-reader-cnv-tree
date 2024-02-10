import { TableRow } from "../types";

export function parseArray(row: TableRow) {
  const res: TableRow[] = [];

  Array.from(row.children.entries() || []).forEach(([name, row]) => {
    res[Number(name)] = row;
  });

  return res;
}

export function parseArrayUnorder(row: TableRow) {
  return Array.from(row.children.values() || []);
}

export function parseToValues(rows: TableRow[]) {
  return rows.flatMap((r) => r.value || []);
}
