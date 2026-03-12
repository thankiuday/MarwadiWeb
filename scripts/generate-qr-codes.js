/**
 * Generates QR codes for table 1, 2, 3 with King's Restaurant branding.
 * Run: node scripts/generate-qr-codes.js
 */

import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://marwadiweb.onrender.com';
const OUTPUT_DIR = path.join(__dirname, '../client/public/qr-codes');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const options = {
  width: 400,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
};

async function generate() {
  for (let table = 1; table <= 3; table++) {
    const url = `${BASE_URL}/table/${table}`;
    const filePath = path.join(OUTPUT_DIR, `table-${table}.png`);
    await QRCode.toFile(filePath, url, options);
    console.log(`Generated: qr-codes/table-${table}.png`);
  }
  console.log('Done! QR codes saved to client/public/qr-codes/');
}

generate().catch(console.error);
