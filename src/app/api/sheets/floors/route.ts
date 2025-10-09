export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getSheetsClient } from "@/lib/gcp/sheetsClient";
import { GOOGLE_SHEET } from "@/lib/constants";
import { ensureSheetsAndHeaders } from "@/lib/../server/initSheets"; // путь подкорректируй если нужен

async function ensureAuthorized() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.SIMPLE_LOGIN_SECRET));
    return true;
  } catch {
    return false;
  }
}

export async function GET(_req: NextRequest) {
  if (!(await ensureAuthorized())) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  // валидируем книгу (есть Schemes и правильные заголовки)
  const check = await ensureSheetsAndHeaders(GOOGLE_SHEET.id);
  if (!check.success) {
    return NextResponse.json({ ok: false, error: check.error || "Invalid spreadsheet" }, { status: 400 });
  }

  try {
    const sheets = getSheetsClient();
    const r = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET.id,
      range: `'${GOOGLE_SHEET.sheets.schemes}'!A2:A`,
      majorDimension: "ROWS",
    });
    const values = r.data.values ?? [];
    // возвращаем список name (без пустых)
    const names = Array.from(new Set(values.map(v => String(v?.[0] ?? "")).filter(Boolean)));
    return NextResponse.json({ ok: true, floors: names }); // для обратной совместимости ключ оставил floors
  } catch (e: any) {
    console.error(e?.response?.data || e);
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 400 });
  }
}
