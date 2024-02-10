import { getCurrentPage } from '../elementFinders';
import { TableRow } from '../types';

function extractTableRows(tableBody: Element) {
  return Array.from(tableBody.children).flatMap((row) => {
    const cells = <HTMLElement[]>Array.from(row.children);
    if (!cells[0] || !cells[0].children.length) {
      console.warn('could not parse row:', row);
      return [];
    }

    const deepness =
      cells[0].firstElementChild?.tagName === 'SPAN'
        ? (<HTMLElement>cells[0].firstElementChild).innerText.length / 2
        : 0;

    return {
      name: (<HTMLElement>cells[0].lastElementChild).innerText,
      type: cells[2]?.innerText,
      value: cells[3]?.innerText,
      deepness,
    };
  });
}

function parseTableData(
  rows: {
    name: string;
    type?: string;
    value?: string;
    deepness: number;
  }[]
): TableRow {
  const parsed = { children: new Map() };
  const parents: TableRow[] = [parsed];

  rows?.forEach((row) => {
    const parsedRow: TableRow = {
      type: row.type,
      value: row.value,
      children: new Map<string, TableRow>(),
    };

    parents[row.deepness].children.set(row.name, parsedRow);
    parents.splice(row.deepness + 1, Infinity, parsedRow);
  });

  return parsed;
}

export function extractCurrentPage() {
  const tableBody = getCurrentPage()[0].querySelector('.nice tbody');
  if (!tableBody) throw new Error('no table found');

  return parseTableData(extractTableRows(tableBody));
}
