export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";
import { GOOGLE_SHEET } from "@/lib/constants";

function sheetsFromToken(accessToken: string) {
  const o = new google.auth.OAuth2();
  o.setCredentials({ access_token: accessToken });
  return google.sheets({ version: "v4", auth: o });
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken as string | undefined;
  if (!accessToken) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  try {
    const sheets = sheetsFromToken(accessToken);
    const r = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET.id,
      range: `'${GOOGLE_SHEET.sheets.floors}'!A2:A`,
      majorDimension: "ROWS",
    });
    const values = r.data.values ?? [];
    const floors = Array.from(new Set(values.map(v => String(v?.[0] ?? "")).filter(Boolean)));
    return NextResponse.json({ ok: true, floors });
  } catch (e: any) {
    console.error(e?.response?.data || e);
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 400 });
  }
}
