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

function makeIdsUnique(content, prefix) {
  const idPattern = /id=["']([^"']+)["']/g;
  const urlPattern = /url\(#([^\)]+)\)/g;
  const hrefPattern = /xlink:href=["']#([^"']+)["']/g;

  const ids = new Set();
  let match;

  while ((match = idPattern.exec(content)) !== null) {
    ids.add(match[1]);
  }

  let result = content;
  ids.forEach((id) => {
    const uniqueId = `${prefix}-${id}`;
    const idRegex = new RegExp(`id=["']${id}["']`, 'g');
    const urlRegex = new RegExp(`url\\(#${id}\\)`, 'g');
    const hrefRegex = new RegExp(`xlink:href=["']#${id}["']`, 'g');
    const hrefRegex2 = new RegExp(`href=["']#${id}["']`, 'g');

    result = result
      .replace(idRegex, `id="${uniqueId}"`)
      .replace(urlRegex, `url(#${uniqueId})`)
      .replace(hrefRegex, `xlink:href="#${uniqueId}"`)
      .replace(hrefRegex2, `href="#${uniqueId}"`);
  });

  return result;
}

function extractDefs(content) {
  const defsElements = [];
  const patterns = [
    /<linearGradient[\s\S]*?<\/linearGradient>/gi,
    /<radialGradient[\s\S]*?<\/radialGradient>/gi,
    /<filter[\s\S]*?<\/filter>/gi,
    /<clipPath[\s\S]*?<\/clipPath>/gi,
    /<mask[\s\S]*?<\/mask>/gi,
    /<pattern[\s\S]*?<\/pattern>/gi,
  ];

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        if (!match.includes('gradientUnits="userSpaceOnUse"')) {
          defsElements.push(match);
        }
      });
    }
  });

  let contentWithoutDefs = content;
  defsElements.forEach((def) => {
    contentWithoutDefs = contentWithoutDefs.replace(def, '');
  });

  contentWithoutDefs = contentWithoutDefs.replace(/<defs>\s*<\/defs>/gi, '');

  return {
    defs: defsElements,
    content: contentWithoutDefs.trim(),
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

  const allDefs = [];
  const symbols = files.map((file) => {
    const svg = fs.readFileSync(file, 'utf8');
    const { content, viewBox } = extractSvgContent(svg);
    const id = toId(file);
    const vb = viewBox ? ` viewBox="${viewBox}"` : '';

    const contentWithUniqueIds = makeIdsUnique(content, id);
    const { defs: extractedDefs, content: contentWithoutExtractedDefs } =
      extractDefs(contentWithUniqueIds);

    if (extractedDefs.length > 0) {
      allDefs.push(...extractedDefs);
    }

    const hasLocalDefs =
      /<(linearGradient|radialGradient|filter|clipPath|mask|pattern)[\s\S]*?<\/(linearGradient|radialGradient|filter|clipPath|mask|pattern)>/i.test(
        contentWithoutExtractedDefs,
      );

    let symbolContent = contentWithoutExtractedDefs;
    if (hasLocalDefs && !/<defs>/i.test(symbolContent)) {
      const localDefs = [];
      const localDefsPatterns = [
        /<linearGradient[\s\S]*?<\/linearGradient>/gi,
        /<radialGradient[\s\S]*?<\/radialGradient>/gi,
        /<filter[\s\S]*?<\/filter>/gi,
        /<clipPath[\s\S]*?<\/clipPath>/gi,
        /<mask[\s\S]*?<\/mask>/gi,
        /<pattern[\s\S]*?<\/pattern>/gi,
      ];

      localDefsPatterns.forEach((pattern) => {
        const matches = symbolContent.match(pattern);
        if (matches) {
          localDefs.push(...matches);
        }
      });

      let contentWithoutLocalDefs = symbolContent;
      localDefs.forEach((def) => {
        contentWithoutLocalDefs = contentWithoutLocalDefs.replace(def, '');
      });

      symbolContent = `<defs>${localDefs.join('')}</defs>${contentWithoutLocalDefs.trim()}`;
    }

    return `  <symbol id="${id}"${vb}>${symbolContent}</symbol>`;
  });

  const defsSection =
    allDefs.length > 0 ? `  <defs>\n    ${allDefs.join('\n    ')}\n  </defs>` : '';

  const sprite = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute;left:-9999px;top:-9999px;overflow:hidden">',
    defsSection,
    symbols.join('\n'),
    '</svg>',
  ]
    .filter(Boolean)
    .join('\n');

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
