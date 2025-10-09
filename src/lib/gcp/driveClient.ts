import { google, drive_v3 } from 'googleapis';
import { getJWT } from './sa';

export function getDriveClient(): drive_v3.Drive {
  const auth = getJWT([
    'https://www.googleapis.com/auth/drive.file',    
    'https://www.googleapis.com/auth/drive.readonly' 
  ]);
  return google.drive({ version: 'v3', auth });
}
