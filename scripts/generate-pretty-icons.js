import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');

// 洗練された夫婦家計簿のSVGアイコン（クリーンなダークネイビー背景＋ピンク＆ブルーのハートハートモチーフ）
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="shintaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <linearGradient id="tomokoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- 背景角丸 -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)" />
  
  <!-- 外側の円の装飾 -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="#334155" stroke-width="8" stroke-dasharray="24 16" opacity="0.6"/>

  <g filter="url(#shadow)">
    <!-- しんたハート (ブルー) -->
    <path d="M210 170 C170 120, 100 160, 120 220 C140 280, 256 370, 256 370 C256 370, 210 270, 210 170 Z" fill="url(#shintaGrad)" opacity="0.95" />
    
    <!-- ともこハート (オレンジ) -->
    <path d="M302 170 C342 120, 412 160, 392 220 C372 280, 256 370, 256 370 C256 370, 302 270, 302 170 Z" fill="url(#tomokoGrad)" opacity="0.95" />
    
    <!-- 中央のウォレット/キラリ -->
    <circle cx="256" cy="240" r="42" fill="#FFFFFF" />
    <path d="M256 215 L263 233 L281 240 L263 247 L256 265 L249 247 L231 240 L249 233 Z" fill="#0F172A" />
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('Pretty SVG Icon generated successfully.');
