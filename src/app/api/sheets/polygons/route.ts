export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getSheetsClient } from "@/lib/gcp/sheetsClient";
import { GOOGLE_SHEET } from "@/lib/constants";
import { ensureSheetsAndHeaders } from "@/server/initSheets";

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

export async function GET(req: NextRequest) {
  if (!(await ensureAuthorized())) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }
  const url = new URL(req.url);
  const name = url.searchParams.get("name") || url.searchParams.get("floor");
  if (!name) {
    return NextResponse.json({ ok: false, error: "Missing 'name' param" }, { status: 400 });
  }

  const check = await ensureSheetsAndHeaders(GOOGLE_SHEET.id);
  if (!check.success) {
    return NextResponse.json({ ok: false, error: check.error || "Invalid spreadsheet" }, { status: 400 });
  }

  try {
    const sheets = getSheetsClient();
    const vr = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET.id,
      range: `'${GOOGLE_SHEET.sheets.schemes}'!A2:C`,
      majorDimension: "ROWS",
    });

    const rows = vr.data.values ?? [];
    const row = rows.find(r => String(r?.[0] ?? "") === String(name));
    if (!row) {
      return NextResponse.json({ ok: false, error: `Scheme "${name}" not found` }, { status: 404 });
    }

    const [, , jsonCell] = row as [string, string, string];
    let payload: any;
    try {
      payload = JSON.parse(jsonCell);
    } catch {
      payload = jsonCell;
    }

    return NextResponse.json({ ok: true, payload });
  } catch (e: any) {
    console.error(e?.response?.data || e);
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 400 });
  }
}
