/**
 * Simple script to generate placeholder assets (sprites and sounds)
 * Usage: pnpm generate-assets
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../../public');

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Generate a simple SVG sprite
const generateSprite = (name: string, color: string) => {
  const svg = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="transparent" />
  <circle cx="100" cy="100" r="80" fill="${color}" fill-opacity="0.8" />
  <circle cx="70" cy="80" r="10" fill="white" />
  <circle cx="130" cy="80" r="10" fill="white" />
  <path d="M 70 130 Q 100 160 130 130" stroke="white" stroke-width="5" fill="none" />
  <text x="50%" y="180" text-anchor="middle" fill="white" font-family="Arial" font-size="20">${name}</text>
</svg>`;
  return svg;
};

// Generate sprites
const spritesDir = path.join(PUBLIC_DIR, 'sprites');
ensureDir(spritesDir);

const sprites = [
  { name: 'idle', color: '#60A5FA' },
  { name: 'working', color: '#34D399' },
  { name: 'gaming', color: '#F472B6' },
  { name: 'browsing', color: '#FBBF24' },
  { name: 'overheating', color: '#EF4444' },
  { name: 'high_load', color: '#F87171' },
  { name: 'thinking', color: '#A78BFA' },
];

sprites.forEach(({ name, color }) => {
  for (let i = 1; i <= 4; i++) {
    const fileName = `${name}-${i}.png`; // Actually SVG content but saved as png extension for mock compatibility
    // In real SVG to PNG conversion we would need canvas/sharp, but for browser testing
    // browsers can render SVG in IMG tags even with wrong extension sometimes, or we just save as .svg
    // To match current code expecting .png, we will save as .svg but code expects .png.
    // Let's just create .svg files and update the store later, OR just create fake PNGs (empty or simple header)
    // Actually, simple SVGs are best placeholders. Let's save as .svg and update store to use .svg for placeholders?
    // No, let's stick to the plan: simple SVG content in .svg file.

    // WAIT: The app expects .png. If we provide SVG content in .png file, it might fail to decode.
    // For a zero-dependency script, we can't easily generate valid PNG binaries.
    // Let's copy a 1x1 pixel transparent PNG or base64 decode one.

    // Better approach: Generate SVGs and update the store to look for SVGs if PNGs fail?
    // OR: Just generate SVGs and name them .svg, and update `DEFAULT_SPRITE_CONFIG` in `spriteStore.ts` to extension: 'svg'
    // But store hardcodes .png.

    // Let's write valid SVGs with .svg extension and tell user to update store if needed.
    // OR, easiest: Just generate SVGs. The code currently hardcodes .png.

    // Let's generate SVGs and update the store to use .svg.
    fs.writeFileSync(
      path.join(spritesDir, `${name}-${i}.svg`),
      generateSprite(`${name} ${i}`, color),
    );
  }
});

// Generate dummy sound files (empty text files or simple wav header)
const soundsDir = path.join(PUBLIC_DIR, 'sounds');
ensureDir(soundsDir);

const sounds = ['alert.mp3', 'active.mp3', 'thinking.mp3', 'notification.mp3', 'focus.mp3'];

// Minimal valid MP3 header (silence) or just a text file (browser might warn but won't crash)
// A 1-second silent MP3 base64
const silentMp3 = new Uint8Array(
  Buffer.from(
    '//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    'base64',
  ),
);

sounds.forEach((sound) => {
  fs.writeFileSync(path.join(soundsDir, sound), silentMp3);
});

console.log('✅ Generated placeholder assets in public/');
console.log(
  '👉 NOTE: Sprites are .svg files. You may need to update spriteStore.ts to use .svg extension for testing.',
);
