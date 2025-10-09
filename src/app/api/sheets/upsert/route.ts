export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { saveOrUpdateFloorPolygons } from "@/server/saveOrUpdateFloorPolygons";

function normalizePayload(raw: any) {
  const src = raw?.exportData ? raw.exportData : raw;
  return {
    name: src?.name,
    url: src?.url,
    json: src?.json,
  };
}

function isValid(body: any): body is { name: string; url: string; json: unknown } {
  return (
    body &&
    typeof body.name === "string" &&
    body.name.trim().length > 0 &&
    typeof body.url === "string" &&
    body.url.trim().length > 0 &&
    (typeof body.json === "string" || typeof body.json === "object")
  );
}

async function ensureAuthorized(): Promise<boolean> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.SIMPLE_LOGIN_SECRET));
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await ensureAuthorized())) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const body = normalizePayload(rawBody);
    if (!isValid(body)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: expected { name:string, url:string, json:object|string }" },
        { status: 400 }
      );
    }

    const res = await saveOrUpdateFloorPolygons(body);
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (e: any) {
    console.error("UPsert error:", e?.response?.data ?? e);
    return NextResponse.json({ success: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}
