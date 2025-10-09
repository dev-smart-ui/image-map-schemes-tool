"use server";

import { getSheetsClient } from "@/lib/gcp/sheetsClient";
import { GOOGLE_SHEET } from "@/lib/constants";


export async function ensureSheetsAndHeaders(
  spreadsheetId: string = GOOGLE_SHEET.id
) {
  try {
    const sheets = getSheetsClient();

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTitles = (meta.data.sheets ?? []).map(s => s.properties?.title).filter(Boolean) as string[];
    const hasSchemes = sheetTitles.includes(GOOGLE_SHEET.sheets.schemes);
    if (!hasSchemes) {
      return { success: false, error: `Invalid spreadsheet: missing sheet "${GOOGLE_SHEET.sheets.schemes}"` };
    }

    const gr = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${GOOGLE_SHEET.sheets.schemes}'!A1:C1`,
      majorDimension: "ROWS",
    });
    const header = (gr.data.values ?? [])[0] ?? [];
    const expected = GOOGLE_SHEET.headers.schemes;

    const equal =
      header.length === expected.length &&
      header.every((v: string, i: number) => String(v).trim() === expected[i]);

    if (!equal) {
      return {
        success: false,
        error: `Invalid spreadsheet: "${GOOGLE_SHEET.sheets.schemes}" must have columns: ${expected.join(
          ", "
        )} in the first row`,
      };
    }

    return { success: true };
  } catch (e: any) {
    console.error(e?.response?.data || e);
    return { success: false, error: e?.message || "Failed to validate spreadsheet" };
  }
}
