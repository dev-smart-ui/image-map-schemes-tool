"use server";

import { appendRows, findRowByFirstColumn, updateRow } from "@/lib/sheets";
import { ensureSheetsAndHeaders } from "./initSheets";
import { GOOGLE_SHEET } from "@/lib/constants";

export async function saveOrUpdateFloorPolygons(payload: any) {
  try {
    if (!payload?.name || !payload?.url || !payload?.json) {
      return { success: false, error: "Invalid payload. Expected { name, url, json, mode? }" };
    }

    const mode = payload.mode === "update" ? "update" : "create";

    const init = await ensureSheetsAndHeaders(GOOGLE_SHEET.id);
    if (!init.success) return init;

    const SHEET_NAME = GOOGLE_SHEET.sheets.schemes;
    const existingRow = await findRowByFirstColumn(SHEET_NAME, payload.name);
    const now = new Date().toISOString();

    const newRow = [
      String(payload.name),
      String(payload.url),
      typeof payload.json === "string" ? payload.json : JSON.stringify(payload.json),
      now,
    ];

    if (mode === "create") {
      if (existingRow) {
        return {
          success: false,
          error: `Record with name "${payload.name}" already exists. Choose a unique name.`,
        };
      }

      const ok = await appendRows(SHEET_NAME, [newRow], "A:D");
      if (!ok) return { success: false, error: "Failed to append new row to Google Sheet." };

      return { success: true, message: `Scheme "${payload.name}" successfully created.` };
    }

    if (!existingRow) {
      return { success: false, error: `Record "${payload.name}" not found for update.` };
    }

    await updateRow(SHEET_NAME, existingRow, newRow, 4);
    return { success: true, message: `Scheme "${payload.name}" successfully updated.` };

  } catch (e: any) {
    console.error(e?.response?.data || e);
    return { success: false, error: e?.message || "Internal server error" };
  }
}
