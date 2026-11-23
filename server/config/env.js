import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
  adminName: process.env.ADMIN_NAME || 'Hostel Administrator',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminPhone: process.env.ADMIN_PHONE || '+920000000000',
  wa: {
    token: process.env.WHATSAPP_API_TOKEN,
    phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    notifyTo: process.env.WHATSAPP_NOTIFY_TO
  }
};

export function assertEnv() {
  const missing = [];
  if (!env.mongoUri) missing.push('MONGODB_URI');
  if (!env.jwtSecret || env.jwtSecret.length < 16) missing.push('JWT_SECRET (min 16 chars)');
  if (missing.length) {
    console.error('Missing/invalid environment variables: ' + missing.join(', ') + '\nCopy .env.example to server/.env and fill it in.');
    process.exit(1);
  }
}
