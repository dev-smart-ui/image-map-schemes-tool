import { google } from 'googleapis';

function getPrivateKey(): string {
  const raw = process.env.GOOGLE_PRIVATE_KEY;
  if (!raw) throw new Error('GOOGLE_PRIVATE_KEY is not set');
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
}

export function getJWT(scopes: string[]) {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  if (!email) throw new Error('GOOGLE_CLIENT_EMAIL is not set');

  return new google.auth.JWT({
    email,
    key: getPrivateKey(),
    scopes,
  });
}
