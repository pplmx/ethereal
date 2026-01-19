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

interface SpriteConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  eyeColor: string;
  mood: 'neutral' | 'happy' | 'sleepy' | 'alert' | 'angry';
}

const generateEtherealSprite = (config: SpriteConfig, index: number) => {
  const { name, primaryColor, secondaryColor, glowColor, eyeColor, mood } = config;
  const uniqueId = `${name}-${index}`;

  // Eye variations based on mood
  const eyeShape = {
    neutral: { rx: 12, ry: 10, animation: 'values="10;8;10" dur="4s"' },
    happy: { rx: 14, ry: 8, animation: 'values="8;6;8" dur="2s"' },
    sleepy: { rx: 12, ry: 4, animation: 'values="4;3;4" dur="6s"' },
    alert: { rx: 14, ry: 12, animation: 'values="12;14;12" dur="1s"' },
    angry: { rx: 14, ry: 6, animation: 'values="6;8;6" dur="0.5s"' },
  }[mood];

  // Animation speed based on state
  const breathSpeed = mood === 'sleepy' ? '5s' : mood === 'alert' ? '1.5s' : '3s';
  const ribbonSpeed = mood === 'sleepy' ? '8s' : mood === 'alert' ? '2s' : '4s';

  const svg = `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- 主光晕滤镜 -->
    <filter id="glow-${uniqueId}" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="8" result="blur1" />
      <feGaussianBlur stdDeviation="16" result="blur2" />
      <feMerge>
        <feMergeNode in="blur2" />
        <feMergeNode in="blur1" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- 外层光环渐变 -->
    <radialGradient id="auraGrad-${uniqueId}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.6" />
      <stop offset="40%" stop-color="${primaryColor}" stop-opacity="0.3" />
      <stop offset="70%" stop-color="${secondaryColor}" stop-opacity="0.1" />
      <stop offset="100%" stop-color="${secondaryColor}" stop-opacity="0" />
    </radialGradient>

    <!-- 核心渐变 -->
    <radialGradient id="coreGrad-${uniqueId}" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="white" stop-opacity="0.9" />
      <stop offset="30%" stop-color="${glowColor}" />
      <stop offset="60%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </radialGradient>

    <!-- 内核高光 -->
    <radialGradient id="innerGlow-${uniqueId}" cx="35%" cy="35%" r="40%">
      <stop offset="0%" stop-color="white" stop-opacity="0.9" />
      <stop offset="50%" stop-color="${glowColor}" stop-opacity="0.4" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0" />
    </radialGradient>

    <!-- 眼睛渐变 -->
    <radialGradient id="eyeGrad-${uniqueId}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${eyeColor}" />
      <stop offset="60%" stop-color="${eyeColor}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${eyeColor}" stop-opacity="0.6" />
    </radialGradient>
  </defs>

  <!-- 外层光环 - 呼吸动画 -->
  <ellipse cx="128" cy="138" rx="90" ry="85" fill="url(#auraGrad-${uniqueId})" filter="url(#glow-${uniqueId})">
    <animate attributeName="rx" values="85;95;85" dur="${breathSpeed}" repeatCount="indefinite" />
    <animate attributeName="ry" values="80;90;80" dur="${breathSpeed}" repeatCount="indefinite" />
    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="${breathSpeed}" repeatCount="indefinite" />
  </ellipse>

  <!-- 飘动的能量缎带 1 -->
  <path fill="none" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round" opacity="0.7" filter="url(#glow-${uniqueId})">
    <animate attributeName="d"
      values="M128 180 Q100 128 128 76 Q156 40 140 20;
              M128 180 Q90 128 128 76 Q166 50 155 25;
              M128 180 Q100 128 128 76 Q156 40 140 20"
      dur="${ribbonSpeed}" repeatCount="indefinite" />
  </path>

  <!-- 飘动的能量缎带 2 -->
  <path fill="none" stroke="${glowColor}" stroke-width="2" stroke-linecap="round" opacity="0.5" filter="url(#glow-${uniqueId})">
    <animate attributeName="d"
      values="M128 180 Q160 128 128 76 Q96 50 110 25;
              M128 180 Q170 128 128 76 Q86 40 95 20;
              M128 180 Q160 128 128 76 Q96 50 110 25"
      dur="${ribbonSpeed}" repeatCount="indefinite" />
  </path>

  <!-- 主体 - 半透明球体 -->
  <ellipse cx="128" cy="138" rx="55" ry="52" fill="url(#coreGrad-${uniqueId})" opacity="0.85" filter="url(#glow-${uniqueId})">
    <animate attributeName="ry" values="52;54;52" dur="${breathSpeed}" repeatCount="indefinite" />
  </ellipse>

  <!-- 内核高光 -->
  <ellipse cx="115" cy="125" rx="35" ry="32" fill="url(#innerGlow-${uniqueId})" />

  <!-- 左眼 -->
  <g filter="url(#glow-${uniqueId})">
    <ellipse cx="110" cy="140" rx="${eyeShape.rx}" ry="${eyeShape.ry}" fill="url(#eyeGrad-${uniqueId})">
      <animate attributeName="ry" ${eyeShape.animation} repeatCount="indefinite" />
    </ellipse>
    <ellipse cx="108" cy="138" rx="4" ry="3" fill="white" opacity="0.9" />
  </g>

  <!-- 右眼 -->
  <g filter="url(#glow-${uniqueId})">
    <ellipse cx="146" cy="140" rx="${eyeShape.rx}" ry="${eyeShape.ry}" fill="url(#eyeGrad-${uniqueId})">
      <animate attributeName="ry" ${eyeShape.animation} repeatCount="indefinite" />
    </ellipse>
    <ellipse cx="144" cy="138" rx="4" ry="3" fill="white" opacity="0.9" />
  </g>

  <!-- 漂浮粒子 -->
  <circle cx="85" cy="100" r="3" fill="${glowColor}" opacity="0.8" filter="url(#glow-${uniqueId})">
    <animate attributeName="cy" values="100;80;100" dur="3s" repeatCount="indefinite" />
    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" />
  </circle>
  <circle cx="170" cy="90" r="2" fill="${primaryColor}" opacity="0.7" filter="url(#glow-${uniqueId})">
    <animate attributeName="cy" values="90;70;90" dur="4s" repeatCount="indefinite" />
  </circle>
  <circle cx="155" cy="180" r="2.5" fill="${secondaryColor}" opacity="0.6" filter="url(#glow-${uniqueId})">
    <animate attributeName="cy" values="180;160;180" dur="3.5s" repeatCount="indefinite" />
  </circle>
  <circle cx="95" cy="175" r="2" fill="${glowColor}" opacity="0.5" filter="url(#glow-${uniqueId})">
    <animate attributeName="cy" values="175;155;175" dur="2.5s" repeatCount="indefinite" />
  </circle>

  <!-- 星星闪烁 -->
  <path d="M75 70 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill="white" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
  </path>
  <path d="M185 85 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 z" fill="${glowColor}" opacity="0.6">
    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.5s" repeatCount="indefinite" />
  </path>
</svg>`;

  return svg;
};

// Sprite configurations with enhanced colors
const sprites: SpriteConfig[] = [
  {
    name: 'idle',
    primaryColor: '#6366F1', // Indigo
    secondaryColor: '#4338CA',
    glowColor: '#A5B4FC',
    eyeColor: '#FDE68A',
    mood: 'neutral',
  },
  {
    name: 'working',
    primaryColor: '#10B981', // Emerald
    secondaryColor: '#047857',
    glowColor: '#6EE7B7',
    eyeColor: '#FDE68A',
    mood: 'happy',
  },
  {
    name: 'gaming',
    primaryColor: '#8B5CF6', // Violet
    secondaryColor: '#6D28D9',
    glowColor: '#C4B5FD',
    eyeColor: '#FCA5A5',
    mood: 'alert',
  },
  {
    name: 'browsing',
    primaryColor: '#06B6D4', // Cyan
    secondaryColor: '#0891B2',
    glowColor: '#67E8F9',
    eyeColor: '#FDE68A',
    mood: 'neutral',
  },
  {
    name: 'overheating',
    primaryColor: '#EF4444', // Red
    secondaryColor: '#B91C1C',
    glowColor: '#FCA5A5',
    eyeColor: '#FEF08A',
    mood: 'angry',
  },
  {
    name: 'high_load',
    primaryColor: '#F59E0B', // Amber
    secondaryColor: '#D97706',
    glowColor: '#FDE68A',
    eyeColor: '#FCA5A5',
    mood: 'alert',
  },
  {
    name: 'thinking',
    primaryColor: '#EC4899', // Pink
    secondaryColor: '#BE185D',
    glowColor: '#F9A8D4',
    eyeColor: '#A5B4FC',
    mood: 'neutral',
  },
  {
    name: 'sleeping',
    primaryColor: '#64748B', // Slate
    secondaryColor: '#475569',
    glowColor: '#94A3B8',
    eyeColor: '#94A3B8',
    mood: 'sleepy',
  },
  {
    name: 'low_battery',
    primaryColor: '#DC2626', // Red-600
    secondaryColor: '#7F1D1D',
    glowColor: '#FCA5A5',
    eyeColor: '#FEF08A',
    mood: 'sleepy',
  },
];

// Generate sprites
const spritesDir = path.join(PUBLIC_DIR, 'sprites');
ensureDir(spritesDir);

for (const config of sprites) {
  for (let i = 1; i <= 4; i++) {
    fs.writeFileSync(
      path.join(spritesDir, `${config.name}-${i}.svg`),
      generateEtherealSprite(config, i),
    );
  }
}

// Generate placeholder sounds
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

console.log('✨ Ethereal High-Fidelity Assets Generated! ✨');
console.log(`   📁 Sprites: ${sprites.length * 4} files`);
console.log(`   🔊 Sounds: ${soundsList.length} files`);
