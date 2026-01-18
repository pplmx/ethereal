import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const generateEtherealSprite = (name: string, color: string, index: number) => {
  const svg = `
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    
    <radialGradient id="coreGrad-${name}-${index}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${color}" stop-opacity="1" />
      <stop offset="30%" stop-color="${color}" stop-opacity="0.7" />
      <stop offset="60%" stop-color="${color}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${color}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Spirit Aura -->
  <circle cx="128" cy="128" r="95" fill="url(#coreGrad-${name}-${index})" opacity="0.6" filter="url(#glow)">
    <animate attributeName="r" values="85;105;85" dur="3s" repeatCount="indefinite" />
    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
  </circle>

  <!-- Prominent Energy Ribbons -->
  <path d="M128 40 Q200 128 128 216 Q56 128 128 40" fill="none" stroke="${color}" stroke-width="4" stroke-opacity="0.8" filter="url(#glow)">
    <animate attributeName="d" 
             values="M128 40 Q200 128 128 216 Q56 128 128 40;
                     M128 20 Q260 128 128 236 Q-4 128 128 20;
                     M128 40 Q200 128 128 216 Q56 128 128 40" 
             dur="4s" repeatCount="indefinite" />
  </path>
  
  <path d="M128 60 Q180 128 128 196 Q76 128 128 60" fill="none" stroke="white" stroke-width="2" stroke-opacity="0.5" filter="url(#glow)">
    <animate attributeName="d" 
             values="M128 60 Q180 128 128 196 Q76 128 128 60;
                     M128 40 Q220 128 128 216 Q36 128 128 40;
                     M128 60 Q180 128 128 196 Q76 128 128 60" 
             dur="6s" repeatCount="indefinite" />
  </path>

  <!-- Intelligence Core -->
  <g filter="url(#glow)">
    <circle cx="128" cy="128" r="28" fill="white" opacity="0.2" />
    <circle cx="128" cy="128" r="14" fill="white" opacity="1">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite" />
      <animate attributeName="r" values="12;16;12" dur="1s" repeatCount="indefinite" />
    </circle>
  </g>

  <!-- Floating Particles -->
  <circle cx="100" cy="100" r="3" fill="white" opacity="0.9">
    <animate attributeName="cy" values="100;70;100" dur="2s" repeatCount="indefinite" />
  </circle>
  <circle cx="156" cy="140" r="2" fill="white" opacity="0.7">
    <animate attributeName="cy" values="140;170;140" dur="3s" repeatCount="indefinite" />
  </circle>

  <text x="128" y="245" text-anchor="middle" fill="white" font-family="monospace" font-size="11" font-weight="bold" opacity="0.6">
    ETHEREAL::${name.toUpperCase()}
  </text>
</svg>`;
  return svg;
};

const spritesDir = path.join(PUBLIC_DIR, 'sprites');
ensureDir(spritesDir);

const sprites = [
  { name: 'idle', color: '#60A5FA' },
  { name: 'working', color: '#10B981' },
  { name: 'gaming', color: '#F43F5E' },
  { name: 'browsing', color: '#F59E0B' },
  { name: 'overheating', color: '#EF4444' },
  { name: 'high_load', color: '#8B5CF6' },
  { name: 'thinking', color: '#EC4899' },
  { name: 'sleeping', color: '#64748B' },
  { name: 'low_battery', color: '#D946EF' },
];

for (const { name, color } of sprites) {
  for (let i = 1; i <= 4; i++) {
    fs.writeFileSync(
      path.join(spritesDir, `${name}-${i}.svg`),
      generateEtherealSprite(name, color, i),
    );
  }
}

const soundsDir = path.join(PUBLIC_DIR, 'sounds');
ensureDir(soundsDir);
const soundsList = ['alert.mp3', 'active.mp3', 'thinking.mp3', 'notification.mp3', 'focus.mp3'];
const silentAudio = new Uint8Array(
  Buffer.from(
    '//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    'base64',
  ),
);
for (const sound of soundsList) {
  fs.writeFileSync(path.join(soundsDir, sound), silentAudio);
}

console.log('✨ Ultimate High-Fidelity Ethereal Assets Generated! ✨');
