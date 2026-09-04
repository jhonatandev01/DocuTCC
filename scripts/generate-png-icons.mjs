import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple CRC32 table for PNG chunk generation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  chunk.writeUInt32BE(crc32(crcBuf), 8 + len);
  return chunk;
}

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type RGBA (6)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Generate pixels
  const rowBytes = width * 4;
  const rawData = Buffer.alloc((1 + rowBytes) * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = width * 0.45;
  const safeMargin = isMaskable ? width * 0.15 : width * 0.05;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default dark theme background: #0f172a
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Outer gold border glow if not maskable
      if (!isMaskable && Math.abs(dist - maxR) < width * 0.02) {
        r = 245;
        g = 158;
        b = 11;
      }

      // Golden book / cap motif in center
      // Graduation cap diamond: |dx| + |dy + height*0.12| < width * 0.22
      const capDy = dy + height * 0.12;
      if (Math.abs(dx * 1.2) + Math.abs(capDy * 2.5) < width * 0.25) {
        // Gold gradient
        const t = (x / width);
        r = Math.round(251 * (1 - t) + 217 * t);
        g = Math.round(191 * (1 - t) + 119 * t);
        b = Math.round(36 * (1 - t) + 6 * t);
      }

      // Academic book pages below cap:
      const bookDy = dy - height * 0.1;
      if (bookDy > -height * 0.05 && bookDy < height * 0.25 && Math.abs(dx) < width * 0.32) {
        // Book shape
        const pageArch = Math.sin((Math.abs(dx) / (width * 0.32)) * Math.PI) * (height * 0.05);
        if (bookDy > pageArch - height * 0.02) {
          // Inside open book
          if (Math.abs(dx) < width * 0.02) {
            // Central spine ribbon (gold)
            r = 245; g = 158; b = 11;
          } else {
            // Book page (deep slate with gold border)
            if (Math.abs(dx) > width * 0.30 || bookDy > height * 0.23) {
              r = 245; g = 158; b = 11; // Gold border
            } else {
              // Page interior with text lines
              const lineRow = Math.floor(bookDy / (height * 0.04));
              if (lineRow % 2 === 0 && Math.abs(dx) > width * 0.05 && Math.abs(dx) < width * 0.28) {
                r = 148; g = 163; b = 184; // Light slate text line
              } else {
                r = 30; g = 41; b = 59; // Dark page paper
              }
            }
          }
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // Deflate IDAT
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.resolve('public');
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(pubDir, 'favicon.ico'), createPng(64, 64, false));

console.log('✅ Generated valid PNG icons: 192x192, 512x512, maskable, apple-touch-icon, favicon.ico');
