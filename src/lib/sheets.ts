import { getSheetsClient } from '@/lib/gcp/sheetsClient';

const SHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

export async function getSheetIdByTitle(title: string) {
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const found = (meta.data.sheets ?? []).find(s => s.properties?.title === title);
  if (!found?.properties?.sheetId) throw new Error(`Sheet "${title}" not found`);
  return found.properties.sheetId;
}

export async function findRowByFirstColumn(sheetName: string, value: string | number) {
  const sheets = getSheetsClient();
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${sheetName}'!A2:A`,
    majorDimension: 'ROWS',
  });
  const rows = r.data.values ?? [];
  const idx = rows.findIndex(row => String(row?.[0] ?? '') === String(value));
  return idx === -1 ? undefined : idx + 2;
}

export async function updateRow(sheetName: string, rowNumber: number, values: any[], width: number) {
  const sheets = getSheetsClient();
  const endCol = String.fromCharCode('A'.charCodeAt(0) + (width - 1));
  const range = `'${sheetName}'!A${rowNumber}:${endCol}${rowNumber}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

export async function appendRows(sheetName: string, values: any[][], columns: string) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `'${sheetName}'!${columns}`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
  return res.status >= 200 && res.status < 300;
}

export async function findAllRowsByFirstColumn(sheetName: string, value: string | number) {
  const sheets = getSheetsClient();
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${sheetName}'!A2:A`,
    majorDimension: 'ROWS',
  });
  const rows = r.data.values ?? [];
  const out: number[] = [];
  rows.forEach((row, i) => {
    if (String(row?.[0] ?? '') === String(value)) out.push(i + 2);
  });
  return out;
}

export async function deleteRowsByNumbers(sheetName: string, rowNumbers: number[]) {
  if (!rowNumbers.length) return;
  const sheets = getSheetsClient();
  const sheetId = await getSheetIdByTitle(sheetName);
  const requests = [...rowNumbers].sort((a, b) => b - a).map(rowNum => ({
    deleteDimension: {
      range: { sheetId, dimension: 'ROWS', startIndex: rowNum - 1, endIndex: rowNum },
    },
  }));
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests },
  });
}
