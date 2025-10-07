import { google } from "googleapis";
import { GOOGLE_SHEET } from "./constants";

function oauthFromAccessToken(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

export function getSheets(accessToken: string) {
  return google.sheets({ version: "v4", auth: oauthFromAccessToken(accessToken) });
}

export async function getSheetIdByTitle(accessToken: string, title: string) {
  const sheets = getSheets(accessToken);
  const meta = await sheets.spreadsheets.get({ spreadsheetId: GOOGLE_SHEET.id });
  const found = (meta.data.sheets ?? []).find(s => s.properties?.title === title);
  if (found?.properties?.sheetId === undefined) throw new Error(`Sheet "${title}" not found`);
  return found.properties.sheetId!;
}

export async function findRowByFirstColumn(
  accessToken: string,
  sheetName: string,
  value: string | number
): Promise<number | undefined> {
  const sheets = getSheets(accessToken);
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET.id,
    range: `'${sheetName}'!A2:A`,
    majorDimension: "ROWS",
  });
  const rows = r.data.values ?? [];
  const idx = rows.findIndex(row => String(row?.[0] ?? "") === String(value));
  return idx === -1 ? undefined : idx + 2;
}

export async function updateRow(
  accessToken: string,
  sheetName: string,
  rowNumber: number,
  values: any[],
  width: number // 6 => A..F
) {
  const sheets = getSheets(accessToken);
  const endCol = String.fromCharCode("A".charCodeAt(0) + (width - 1));
  const range = `'${sheetName}'!A${rowNumber}:${endCol}${rowNumber}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEET.id,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

export async function appendRows(
  accessToken: string,
  sheetName: string,
  values: any[][],
  columns: string // "A:F"
) {
  const sheets = getSheets(accessToken);
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET.id,
    range: `'${sheetName}'!${columns}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
  return res.status >= 200 && res.status < 300;
}

export async function findAllRowsByFirstColumn(
  accessToken: string,
  sheetName: string,
  value: string | number
): Promise<number[]> {
  const sheets = getSheets(accessToken);
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET.id,
    range: `'${sheetName}'!A2:A`,
    majorDimension: "ROWS",
  });
  const rows = r.data.values ?? [];
  const out: number[] = [];
  rows.forEach((row, i) => {
    if (String(row?.[0] ?? "") === String(value)) out.push(i + 2);
  });
  return out;
}

export async function deleteRowsByNumbers(
  accessToken: string,
  sheetName: string,
  rowNumbers: number[]
) {
  if (!rowNumbers.length) return;
  const sheets = getSheets(accessToken);
  const sheetId = await getSheetIdByTitle(accessToken, sheetName);
  const requests = [...rowNumbers].sort((a,b)=>b-a).map(rowNum => ({
    deleteDimension: {
      range: {
        sheetId,
        dimension: "ROWS",
        startIndex: rowNum - 1,
        endIndex: rowNum,
      },
    },
  }));
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: GOOGLE_SHEET.id,
    requestBody: { requests },
  });
}
