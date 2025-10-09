import { google, sheets_v4 } from 'googleapis';
import { getJWT } from './sa';

export function getSheetsClient(): sheets_v4.Sheets {
  const auth = getJWT([
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ]);
  return google.sheets({ version: 'v4', auth });
}
