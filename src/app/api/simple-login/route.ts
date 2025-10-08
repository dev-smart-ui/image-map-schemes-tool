import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password !== process.env.SIMPLE_LOGIN_PASSWORD) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.SIMPLE_LOGIN_SECRET);
  const token = await new SignJWT({ authorized: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(secret);

  const res = NextResponse.json({ success: true });
  res.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return res;
}
