"use server";

import { appendRows, findRowByFirstColumn, updateRow, findAllRowsByFirstColumn, deleteRowsByNumbers } from "@/lib/sheets";
import { ensureSheetsAndHeaders } from "./initSheets";

const FLOORS_NAME = process.env.SHEETS_FLOORS!;
const POLYGONS_NAME = process.env.SHEETS_POLYGONS!;

export async function saveOrUpdateFloorPolygons(payload: any) {
  if (!payload?.floorOrLevel || !payload?.imageId || !payload?.imageSizes) {
    return { success: false, error: "Invalid payload" };
  }

  const init = await ensureSheetsAndHeaders();
  if (!init.success) return init;

  const now = new Date().toISOString();

  const floorsRow = [
    String(payload.floorOrLevel),
    String(payload.imageId),
    String(payload.imageUrl ?? ""),
    Number(payload.imageSizes?.widthPx ?? 0),
    Number(payload.imageSizes?.heightPx ?? 0),
    now,
  ];

  const existingRow = await findRowByFirstColumn(FLOORS_NAME, payload.floorOrLevel);

  if (existingRow) {
    await updateRow(FLOORS_NAME, existingRow, floorsRow, 6);
  } else {
    const ok = await appendRows(FLOORS_NAME, [floorsRow], "A:F");
    if (!ok) return { success: false, error: "Append to Floors failed" };
  }

  const polygonRows: any[][] = (payload.units ?? []).map((u: any) => ([
    String(payload.floorOrLevel),
    String(u.unitId),
    JSON.stringify({ polygons: u.polygons ?? [] }),
    now,
  ]));

  const rowsToDelete = await findAllRowsByFirstColumn(POLYGONS_NAME, payload.floorOrLevel);
  if (rowsToDelete.length) {
    await deleteRowsByNumbers(POLYGONS_NAME, rowsToDelete);
  }
  if (polygonRows.length) {
    const okPoly = await appendRows(POLYGONS_NAME, polygonRows, "A:D");
    if (!okPoly) return { success: false, error: "Append to Polygons failed" };
  }

  return {
    success: true,
    data: { updatedFloorRow: !!existingRow, polygonsWritten: polygonRows.length },
  };
}
