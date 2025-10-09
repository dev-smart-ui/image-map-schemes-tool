export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { GOOGLE_SHEET } from '@/lib/constants';
import { getSheetsClient } from '@/lib/gcp/sheetsClient';

async function ensureAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
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
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const sheets = getSheetsClient();
    const r = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET.id,
      range: `'${GOOGLE_SHEET.sheets.floors}'!A2:A`,
      majorDimension: 'ROWS',
    });
    const values = r.data.values ?? [];
    const floors = Array.from(new Set(values.map(v => String(v?.[0] ?? '')).filter(Boolean)));
    return NextResponse.json({ ok: true, floors });
  } catch (e: any) {
    console.error(e?.response?.data || e);
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 400 });
  }
}
