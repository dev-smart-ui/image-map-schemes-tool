import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getDriveClient } from '@/lib/gcp/driveClient';

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

export async function POST(req: NextRequest) {
  if (!(await ensureAuthorized())) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;
  const parent = String(form.get('parent') ?? '');

  if (!file) return NextResponse.json({ ok: false, error: 'Missing file' }, { status: 400 });

  const drive = getDriveClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const created = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: parent ? [parent] : undefined,
      mimeType: file.type || 'application/octet-stream',
    },
    media: {
      mimeType: file.type || 'application/octet-stream',
      body: Buffer.from(buffer),
    },
    fields: 'id, name, webViewLink, webContentLink',
  });

  return NextResponse.json({ ok: true, file: created.data });
}
