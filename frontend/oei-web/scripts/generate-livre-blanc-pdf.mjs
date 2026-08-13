// Renders the French `content/fr/200-WHITE-PAPERS/livre-blanc-complet.md` White Paper
// into a standalone PDF, in the same spirit as `copy-content-assets.mjs`: a small,
// dependency-light Node script rather than a build-pipeline concern. Uses `pdfkit`
// (pure JS, no native binary, no headless-browser download) because this sandbox has
// no pandoc/wkhtmltopdf and cannot fetch Chromium for puppeteer/playwright.
//
// The Markdown parser below is intentionally minimal — headings, paragraphs,
// blockquotes, bullet/numbered lists and fenced code blocks — matching exactly what
// the White Paper actually uses. It is not a general-purpose Markdown engine.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..', '..');

const SOURCE_MD = path.resolve(repoRoot, 'content', 'fr', '200-WHITE-PAPERS', 'livre-blanc-complet.md');
const OUTPUT_PATHS = [
  path.resolve(repoRoot, '.prompt', 'Livre-Blanc-OEI-v4.pdf'),
  path.resolve(here, '..', 'public', 'assets', 'livre-blanc', 'livre-blanc-oei-v4.pdf'),
];

const NAVY = '#0a1e3f';
const GOLD = '#e8a530';
const WHITE = '#ffffff';
const INK = '#1a1a1a';
const MUTED = '#5a5a5a';

const ORG_NAME = "Ordre International des Experts de l'Informatique";
const ORG_ACRONYM = 'OEI';

// --- 1. Read + split front matter ------------------------------------------------

if (!existsSync(SOURCE_MD)) {
  console.error(`[generate-livre-blanc-pdf] source not found: ${SOURCE_MD}`);
  process.exit(1);
}

const raw = readFileSync(SOURCE_MD, 'utf-8');
const frontMatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!frontMatterMatch) {
  console.error('[generate-livre-blanc-pdf] could not find front matter block');
  process.exit(1);
}
const [, frontMatterRaw, bodyRaw] = frontMatterMatch;

/** Extracts a quoted `key: "value"` from the naive YAML front matter. */
function frontMatterField(name) {
  const m = frontMatterRaw.match(new RegExp(`^${name}:\\s*"([^"]*)"`, 'm'));
  return m ? m[1] : '';
}

const meta = {
  title: frontMatterField('title') || 'Livre Blanc',
  version: frontMatterField('version') || 'v4',
  date: frontMatterField('date') || new Date().toISOString().slice(0, 10),
};

// --- 2. Minimal Markdown -> block model -----------------------------------------

/** @typedef {{ type: 'h1'|'h2'|'h3'|'p'|'quote'|'li'|'oli'|'hr'|'code', text?: string }} Block */

/** Strips the inline Markdown emphasis markers we use (`**bold**`, `*italic*`, `` `code` ``). */
function stripInlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

/** @returns {Block[]} */
function parseMarkdown(md) {
  const lines = md.split('\n');
  /** @type {Block[]} */
  const blocks = [];
  let i = 0;
  let paragraphBuffer = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ type: 'p', text: stripInlineMarkdown(paragraphBuffer.join(' ')) });
      paragraphBuffer = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      flushParagraph();
      i += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      flushParagraph();
      i += 1;
      const codeLines = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // skip closing fence
      blocks.push({ type: 'code', text: codeLines.join('\n') });
      continue;
    }

    if (trimmed === '---') {
      flushParagraph();
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph();
      blocks.push({ type: 'h3', text: stripInlineMarkdown(trimmed.slice(4)) });
      i += 1;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      blocks.push({ type: 'h2', text: stripInlineMarkdown(trimmed.slice(3)) });
      i += 1;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushParagraph();
      blocks.push({ type: 'h1', text: stripInlineMarkdown(trimmed.slice(2)) });
      i += 1;
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushParagraph();
      const quoteLines = [trimmed.slice(2)];
      i += 1;
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push({ type: 'quote', text: stripInlineMarkdown(quoteLines.join(' ')) });
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      blocks.push({ type: 'li', text: stripInlineMarkdown(bulletMatch[1]) });
      i += 1;
      continue;
    }

    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      blocks.push({ type: 'oli', text: stripInlineMarkdown(orderedMatch[2]), n: orderedMatch[1] });
      i += 1;
      continue;
    }

    // Plain paragraph line — accumulate until the next blank/structural line.
    paragraphBuffer.push(trimmed);
    i += 1;
  }
  flushParagraph();

  return blocks;
}

const blocks = parseMarkdown(bodyRaw);

// --- 3. Render PDF -----------------------------------------------------------------

const doc = new PDFDocument({ size: 'A4', margins: { top: 70, bottom: 70, left: 70, right: 70 } });
const chunks = [];
doc.on('data', (chunk) => chunks.push(chunk));

const pageWidth = doc.page.width;
const pageHeight = doc.page.height;

// --- 3.1 Cover page ---

doc.rect(0, 0, pageWidth, pageHeight).fill(NAVY);

doc
  .fillColor(GOLD)
  .lineWidth(2)
  .moveTo(pageWidth / 2 - 90, 210)
  .lineTo(pageWidth / 2 + 90, 210)
  .strokeColor(GOLD)
  .stroke();

doc
  .font('Helvetica-Bold')
  .fontSize(52)
  .fillColor(WHITE)
  .text('LIVRE BLANC', 0, 260, { align: 'center', width: pageWidth });

doc
  .font('Helvetica')
  .fontSize(16)
  .fillColor(GOLD)
  .text('Pour une reconnaissance progressive de la profession informatique', 90, 340, {
    align: 'center',
    width: pageWidth - 180,
  });

doc
  .moveTo(pageWidth / 2 - 60, 430)
  .lineTo(pageWidth / 2 + 60, 430)
  .strokeColor(GOLD)
  .stroke();

doc
  .font('Helvetica-Bold')
  .fontSize(20)
  .fillColor(WHITE)
  .text(`${ORG_NAME} (${ORG_ACRONYM})`, 80, 520, { align: 'center', width: pageWidth - 160 });

doc
  .font('Helvetica')
  .fontSize(13)
  .fillColor(GOLD)
  .text('Mouvement fondateur international', 0, 590, { align: 'center', width: pageWidth });

doc
  .font('Helvetica-Bold')
  .fontSize(15)
  .fillColor(GOLD)
  .text(`Version ${meta.version.replace(/^v/i, '')}`, 0, pageHeight - 160, { align: 'center', width: pageWidth });

doc
  .font('Helvetica')
  .fontSize(11)
  .fillColor(WHITE)
  .text(meta.date, 0, pageHeight - 130, { align: 'center', width: pageWidth });

// --- 3.2 Body pages ---

doc.addPage({ margins: { top: 70, bottom: 70, left: 70, right: 70 } });

const bodyWidth = pageWidth - 140;

for (const block of blocks) {
  switch (block.type) {
    case 'h1':
      doc
        .font('Helvetica-Bold')
        .fontSize(26)
        .fillColor(NAVY)
        .text(block.text, { width: bodyWidth });
      doc.moveDown(0.3);
      break;
    case 'h2':
      doc.moveDown(0.4);
      doc
        .font('Helvetica-Bold')
        .fontSize(19)
        .fillColor(NAVY)
        .text(block.text, { width: bodyWidth });
      doc
        .moveTo(doc.x, doc.y + 2)
        .lineTo(doc.x + 90, doc.y + 2)
        .strokeColor(GOLD)
        .lineWidth(2)
        .stroke();
      doc.moveDown(0.5);
      break;
    case 'h3':
      doc.moveDown(0.3);
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(NAVY)
        .text(block.text, { width: bodyWidth });
      doc.moveDown(0.25);
      break;
    case 'p':
      doc
        .font('Helvetica')
        .fontSize(10.5)
        .fillColor(INK)
        .text(block.text, { width: bodyWidth, align: 'justify' });
      doc.moveDown(0.5);
      break;
    case 'quote': {
      const quoteX = doc.x + 18;
      doc
        .font('Helvetica-Oblique')
        .fontSize(11)
        .fillColor(MUTED);
      const startY = doc.y;
      doc.text(block.text, quoteX, startY, { width: bodyWidth - 18, align: 'left' });
      const endY = doc.y;
      doc
        .moveTo(doc.x, startY - 2)
        .lineTo(doc.x, endY + 2)
        .strokeColor(GOLD)
        .lineWidth(3)
        .stroke();
      doc.moveDown(0.5);
      break;
    }
    case 'li':
      doc
        .font('Helvetica')
        .fontSize(10.5)
        .fillColor(INK)
        .text(`•  ${block.text}`, { width: bodyWidth, indent: 12, align: 'justify' });
      doc.moveDown(0.2);
      break;
    case 'oli':
      doc
        .font('Helvetica')
        .fontSize(10.5)
        .fillColor(INK)
        .text(`${block.n}.  ${block.text}`, { width: bodyWidth, indent: 12, align: 'justify' });
      doc.moveDown(0.2);
      break;
    case 'code':
      doc
        .font('Helvetica-Oblique')
        .fontSize(9)
        .fillColor(MUTED)
        .text('[Diagramme non reproduit dans cette version PDF — voir le corpus Markdown source.]', {
          width: bodyWidth,
        });
      doc.moveDown(0.5);
      break;
    case 'hr':
      if (doc.y < pageHeight - 100) {
        doc
          .moveTo(doc.x, doc.y + 4)
          .lineTo(doc.x + bodyWidth, doc.y + 4)
          .strokeColor('#cccccc')
          .lineWidth(0.5)
          .stroke();
        doc.moveDown(0.6);
      }
      break;
    default:
      break;
  }
}

doc.end();

await new Promise((resolve) => doc.on('end', resolve));
const pdfBuffer = Buffer.concat(chunks);

for (const outputPath of OUTPUT_PATHS) {
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, pdfBuffer);
  console.log(`[generate-livre-blanc-pdf] wrote ${outputPath} (${pdfBuffer.length} bytes)`);
}
