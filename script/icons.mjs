#!/usr/bin/env node
// Script unique pour icônes: télécharge depuis iconify.txt et construit le sprite
// Usage: node script/icons.mjs

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const iconsDir = path.join(projectRoot, 'public', 'icons');
const spriteFile = path.join(projectRoot, 'public', 'sprite.svg');
const iconifyList = path.join(iconsDir, 'iconify.txt');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function toId(filePath) {
  return path
    .basename(filePath, '.svg')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function extractSvgContent(svg) {
  svg = svg.replace(/<\?xml[^>]*>|<!--[\s\S]*?-->/g, '').trim();
  const match = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  if (!match) return { content: svg, viewBox: null };

  const openTag = svg.match(/<svg[^>]*>/i)[0];
  const viewBoxMatch = openTag.match(/viewBox=["']([^"']+)["']/i);
  return {
    content: match[1].trim(),
    viewBox: viewBoxMatch ? viewBoxMatch[1] : null,
  };
}

async function downloadFromList() {
  if (!fs.existsSync(iconifyList)) return;

  const content = fs.readFileSync(iconifyList, 'utf8');
  const icons = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  if (icons.length === 0) return;

  console.log(`📦 Téléchargement de ${icons.length} icônes...`);

  for (const icon of icons) {
    const [collection, name] = icon.split(':');
    if (!collection || !name) continue;

    const filename = `${collection}-${name}.svg`;
    const filepath = path.join(iconsDir, filename);

    if (fs.existsSync(filepath)) continue;

    try {
      const url = `https://api.iconify.design/${collection}/${name}.svg`;
      const svg = await download(url);
      ensureDir(iconsDir);
      fs.writeFileSync(filepath, svg);
      console.log(`✓ ${icon} -> ${filename}`);
    } catch (err) {
      console.warn(`✗ Échec ${icon}: ${err.message}`);
    }
  }
}

function buildSprite() {
  ensureDir(path.dirname(spriteFile));

  if (!fs.existsSync(iconsDir)) {
    console.warn('📁 Dossier public/icons introuvable. Rien à faire.');
    return;
  }

  const files = fs
    .readdirSync(iconsDir)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => path.join(iconsDir, f));

  if (files.length === 0) {
    console.warn(
      '📄 Aucun SVG trouvé. Ajoutez des fichiers dans public/icons ou une liste dans public/icons/iconify.txt',
    );
    return;
  }

  const symbols = files.map((file) => {
    const svg = fs.readFileSync(file, 'utf8');
    const { content, viewBox } = extractSvgContent(svg);
    const id = toId(file);
    const vb = viewBox ? ` viewBox="${viewBox}"` : '';
    return `  <symbol id="${id}"${vb}>${content}</symbol>`;
  });

  const sprite = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">',
    ...symbols,
    '</svg>',
  ].join('\n');

  fs.writeFileSync(spriteFile, sprite);
  console.log(`🎨 Sprite généré: ${files.length} icônes dans public/sprite.svg`);
}

(async () => {
  try {
    await downloadFromList();
    buildSprite();
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
})();
