"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GOOGLE_SHEET } from "@/lib/constants";
import {
  appendRows,
  findRowByFirstColumn,
  updateRow,
  findAllRowsByFirstColumn,
  deleteRowsByNumbers,
} from "@/lib/sheets";
import { ensureSheetsAndHeaders } from "./initSheets";

export async function saveOrUpdateFloorPolygons(payload: any) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken as string | undefined;
  if (!accessToken) return { success: false, error: "Not authenticated" };

  if (!payload?.floorOrLevel || !payload?.imageId || !payload?.imageSizes) {
    return { success: false, error: "Invalid payload" };
  }

  const init = await ensureSheetsAndHeaders();
  if (!init.success) return init;

  const now = new Date().toISOString();

  // Floors row
  const floorsRow = [
    String(payload.floorOrLevel),
    String(payload.imageId),
    String(payload.imageUrl ?? ""),
    Number(payload.imageSizes?.widthPx ?? 0),
    Number(payload.imageSizes?.heightPx ?? 0),
    now,
  ];

  const existingRow = await findRowByFirstColumn(
    accessToken,
    GOOGLE_SHEET.sheets.floors,
    payload.floorOrLevel
  );

  if (existingRow) {
    await updateRow(accessToken, GOOGLE_SHEET.sheets.floors, existingRow, floorsRow, 6);
  } else {
    const ok = await appendRows(accessToken, GOOGLE_SHEET.sheets.floors, [floorsRow], "A:F");
    if (!ok) return { success: false, error: "Append to FloorsAndLevels failed" };
  }

  const polygonRows: any[][] = (payload.units ?? []).map((u: any) => ([
    String(payload.floorOrLevel),
    String(u.unitId),
    JSON.stringify({ polygons: u.polygons ?? [] }),
    now,
  ]));

  const rowsToDelete = await findAllRowsByFirstColumn(
    accessToken,
    GOOGLE_SHEET.sheets.polygons,
    payload.floorOrLevel
  );
  if (rowsToDelete.length) {
    await deleteRowsByNumbers(accessToken, GOOGLE_SHEET.sheets.polygons, rowsToDelete);
  }
  if (polygonRows.length) {
    const okPoly = await appendRows(accessToken, GOOGLE_SHEET.sheets.polygons, polygonRows, "A:D");
    if (!okPoly) return { success: false, error: "Append to Polygons failed" };
  }

  return {
    success: true,
    data: { updatedFloorRow: !!existingRow, polygonsWritten: polygonRows.length },
  };
}
