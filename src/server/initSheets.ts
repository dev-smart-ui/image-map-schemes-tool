"use server";

import { getSheetsClient } from "@/lib/gcp/sheetsClient";
import { GOOGLE_SHEET } from "@/lib/constants";

export async function ensureSheetsAndHeaders(
  spreadsheetId: string = GOOGLE_SHEET.id
) {
  try {
    const sheets = getSheetsClient(); 

    const floorsName = GOOGLE_SHEET.sheets.floors;
    const polygonsName = GOOGLE_SHEET.sheets.polygons;

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetProps = (meta.data.sheets ?? [])
      .map(s => s.properties!)
      .filter(Boolean);
    const byTitle = new Map(sheetProps.map(p => [p.title!, p]));
    const hasFloors = byTitle.has(floorsName);
    const hasPolygons = byTitle.has(polygonsName);

    const requests: any[] = [];

    if (sheetProps.length === 1 && !hasFloors && !hasPolygons) {
      requests.push({
        updateSheetProperties: {
          properties: { sheetId: sheetProps[0].sheetId, title: floorsName },
          fields: "title",
        },
      });
      requests.push({ addSheet: { properties: { title: polygonsName } } });
    } else {
      if (!hasFloors) requests.push({ addSheet: { properties: { title: floorsName } } });
      if (!hasPolygons) requests.push({ addSheet: { properties: { title: polygonsName } } });
    }

    if (requests.length) {
      await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: [
          { range: `'${floorsName}'!A1`,   values: [GOOGLE_SHEET.headers.floors] },
          { range: `'${polygonsName}'!A1`, values: [GOOGLE_SHEET.headers.polygons] },
        ],
      },
    });

    const meta2 = await sheets.spreadsheets.get({ spreadsheetId });
    const findId = (title: string) =>
      (meta2.data.sheets ?? []).find(s => s.properties?.title === title)?.properties?.sheetId!;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: { sheetId: findId(floorsName), gridProperties: { frozenRowCount: 1 } },
              fields: "gridProperties.frozenRowCount",
            },
          },
          {
            updateSheetProperties: {
              properties: { sheetId: findId(polygonsName), gridProperties: { frozenRowCount: 1 } },
              fields: "gridProperties.frozenRowCount",
            },
          },
        ],
      },
    });

    return { success: true };
  } catch (e: any) {
    console.error(e?.response?.data || e);
    return { success: false, error: e?.message || "Failed to init sheets" };
  }
}
