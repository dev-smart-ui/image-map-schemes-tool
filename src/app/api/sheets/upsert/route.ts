export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { saveOrUpdateFloorPolygons } from "@/server/saveOrUpdateFloorPolygons";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });

    const res = await saveOrUpdateFloorPolygons(body);
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ success: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}
