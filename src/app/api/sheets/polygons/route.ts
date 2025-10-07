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

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken as string | undefined;
  if (!accessToken) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const floor = new URL(req.url).searchParams.get("floor");
  if (!floor) return NextResponse.json({ ok: false, error: "Missing 'floor' param" }, { status: 400 });

  try {
    const sheets = sheetsFromToken(accessToken);

    const fr = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET.id,
      range: `'${GOOGLE_SHEET.sheets.floors}'!A2:F`,
      majorDimension: "ROWS",
    });
    const frows = fr.data.values ?? [];
    const fmeta = frows.find(r => String(r?.[0] ?? "") === String(floor));
    if (!fmeta) return NextResponse.json({ ok: false, error: `Floor ${floor} not found` }, { status: 404 });

    const [floorOrLevel, imageId, imageUrl, widthPx, heightPx] = fmeta;

    const pr = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET.id,
      range: `'${GOOGLE_SHEET.sheets.polygons}'!A2:D`,
      majorDimension: "ROWS",
    });
    const prows = (pr.data.values ?? []).filter(r => String(r?.[0] ?? "") === String(floor));

    const byUnit = new Map<string, { unitId: string; polygons: { points: [number, number][] }[] }>();
    for (const row of prows) {
      const unitId = String(row?.[1] ?? "");
      const json = String(row?.[2] ?? "");
      if (!unitId) continue;

      let parsed: any = null;
      try { parsed = JSON.parse(json); } catch {}
      const polys = Array.isArray(parsed?.polygons) ? parsed.polygons : [];

      if (!byUnit.has(unitId)) byUnit.set(unitId, { unitId, polygons: [] });
      for (const p of polys) {
        if (p && Array.isArray(p.points)) byUnit.get(unitId)!.polygons.push({ points: p.points });
      }
    }

    const payload = {
      floorOrLevel,
      imageId,
      imageUrl,
      imageSizes: { widthPx: Number(widthPx || 0), heightPx: Number(heightPx || 0) },
      units: Array.from(byUnit.values()),
    };

    return NextResponse.json({ ok: true, payload });
  } catch (e: any) {
    console.error(e?.response?.data || e);
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 400 });
  }
}
