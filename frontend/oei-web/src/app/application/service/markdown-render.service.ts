import { Service, inject, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Minimal Markdown -> HTML renderer for the back-office preview (task brief: "textarea + preview
// HTML basique — pas besoin d'un vrai éditeur WYSIWYG riche"). No dependency was added:
// `package.json` has no Markdown library installed (checked before writing this) and the CMS only
// needs to preview a handful of block/inline constructs, not arbitrary CommonMark.
//
// Security: rendered HTML is always passed through Angular's `DomSanitizer.sanitize(HTML, ...)`
// before being handed back — never `bypassSecurityTrustHtml` — so `[innerHTML]` bindings using
// this service's output are never exposed to unsanitized user Markdown (script tags, on* handlers,
// javascript: URLs, etc. are stripped by Angular's sanitizer). This is the "sanitization HTML"
// requirement from the plan's "Sécurité" section.
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  return html;
}

/** Removes diacritics/accents, non-alphanumeric characters, and collapses whitespace into
 * hyphens — used to derive a stable `id` for a heading from its rendered text (e.g. "1.
 * Pourquoi ce document, pourquoi maintenant" -> "1-pourquoi-ce-document-pourquoi-maintenant"),
 * so a table of contents built from `extractHeadings` links to the exact same anchor that
 * `markdownToUnsafeHtml({ headingIds: true })` writes on the `<h2>`/`<h3>` element. */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export interface MarkdownRenderOptions {
  /** When true, every rendered heading gets an `id="<slugify(text)>"` attribute (see `slugify`).
   * Off by default so the existing CMS preview (which never needed in-page anchors) keeps
   * producing byte-identical output. */
  readonly headingIds?: boolean;
  /** How ```mermaid fenced blocks are rendered:
   * - `'source'` (default): a labelled box showing the raw Mermaid source — safe everywhere,
   *   including the CMS preview, which never loads the Mermaid engine.
   * - `'diagram'`: emits `<pre class="mermaid">` containing the raw (unescaped) Mermaid source,
   *   the exact markup the `mermaid` package's `run()` looks for and replaces with a rendered
   *   SVG. Only use this where the caller actually loads and runs Mermaid against the rendered
   *   DOM afterwards (currently: the Livre Blanc page) — everywhere else it would just show
   *   raw, unrendered diagram syntax. */
  readonly mermaid?: 'source' | 'diagram';
}

export interface MarkdownHeading {
  readonly level: number;
  readonly text: string;
  readonly slug: string;
}

/** Strips a YAML front-matter block (`---\nkey: value\n---`) from the start of a Markdown
 * document, if present — used for the Livre Blanc source file, whose front matter (title,
 * version, status, date) is metadata, not document body. Returns the input unchanged when no
 * front matter is found. */
export function stripFrontmatter(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  if (lines[0]?.trim() !== '---') {
    return markdown;
  }
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      return lines
        .slice(i + 1)
        .join('\n')
        .replace(/^\n+/, '');
    }
  }
  return markdown;
}

/** Scans a Markdown document for `##`/`###` headings (by default) without rendering it, e.g. to
 * build a table of contents/floating side menu. Headings inside fenced code blocks (```...```)
 * are ignored. `slug` matches exactly what `markdownToUnsafeHtml({ headingIds: true })` writes as
 * the corresponding element's `id`. */
/** Keeps only the Markdown up to (and including) the section started by a `##` heading whose
 * text matches `headingText` (case-insensitive), stopping right before the *next* `##` heading —
 * i.e. everything up to and including that section's own `###` subsections, but none of the
 * sections that follow it. Used to show only the executive summary of the Livre Blanc online
 * and push readers to the PDF download for the rest. Returns the input unchanged if no heading
 * matches (fail open — better to show the full document than to show nothing). */
export function truncateAfterSection(markdown: string, headingText: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const normalized = headingText.trim().toLowerCase();
  let startIndex = -1;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^```/.test(lines[i].trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^##\s+(.*)$/.exec(lines[i]);
    if (match && match[1].trim().toLowerCase() === normalized) {
      startIndex = i;
      break;
    }
  }
  if (startIndex === -1) {
    return markdown;
  }
  inFence = false;
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (/^```/.test(lines[i].trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^##\s+/.test(lines[i])) {
      return lines.slice(0, i).join('\n');
    }
  }
  return markdown;
}

export function extractHeadings(
  markdown: string,
  levels: readonly number[] = [2, 3],
): MarkdownHeading[] {
  const headings: MarkdownHeading[] = [];
  let inFence = false;
  for (const rawLine of markdown.replace(/\r\n/g, '\n').split('\n')) {
    if (/^```/.test(rawLine.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    const match = /^(#{1,6})\s+(.*)$/.exec(rawLine);
    if (match && levels.includes(match[1].length)) {
      const text = match[2].trim();
      headings.push({ level: match[1].length, text, slug: slugify(text) });
    }
  }
  return headings;
}

/** Converts a small, deliberately-limited Markdown subset (headings, paragraphs, bold/italic/
 * code, links, unordered/ordered lists, blockquotes, horizontal rules, fenced code blocks) into
 * raw (unsanitized) HTML.
 *
 * Fenced ```mermaid blocks are NOT rendered as an actual diagram — this renderer has no diagram
 * engine — they are shown as a labelled box containing the raw Mermaid source, so the reader at
 * least sees the diagram's textual description instead of losing it silently. Any other fenced
 * code block is rendered as a plain `<pre><code>`. */
export function markdownToUnsafeHtml(
  markdown: string,
  options: MarkdownRenderOptions = {},
): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let listTag: 'ul' | 'ol' | null = null;
  let blockquoteBuffer: string[] = [];
  let inFence = false;
  let fenceLang = '';
  let fenceBuffer: string[] = [];

  const flushParagraph = (): void => {
    if (paragraphBuffer.length > 0) {
      blocks.push(`<p>${renderInline(paragraphBuffer.join(' '))}</p>`);
      paragraphBuffer = [];
    }
  };
  const flushList = (): void => {
    if (listTag && listBuffer.length > 0) {
      blocks.push(`<${listTag}>${listBuffer.join('')}</${listTag}>`);
    }
    listBuffer = [];
    listTag = null;
  };
  const flushBlockquote = (): void => {
    if (blockquoteBuffer.length > 0) {
      blocks.push(`<blockquote><p>${renderInline(blockquoteBuffer.join(' '))}</p></blockquote>`);
    }
    blockquoteBuffer = [];
  };
  const flushFence = (): void => {
    if (fenceLang === 'mermaid' && options.mermaid === 'diagram') {
      // HTML-escaped, not raw: our diagrams use literal `<br/>` inside node labels (e.g.
      // `F["Formation<br/>initiale"]`) — left unescaped, the browser's HTML parser would turn
      // that into a real <br> *element* before Mermaid ever runs, and `.textContent` would then
      // silently drop it instead of handing Mermaid the literal "<br/>" it expects. Escaping
      // keeps it as text; `.textContent` decodes the entities back before Mermaid parses it.
      blocks.push(`<pre class="mermaid">${escapeHtml(fenceBuffer.join('\n'))}</pre>`);
    } else if (fenceLang === 'mermaid') {
      blocks.push(
        `<div class="markdown-diagram"><p class="markdown-diagram__label">Diagramme (source Mermaid — rendu textuel simplifié, sans moteur de diagramme)</p><pre class="markdown-diagram__source">${escapeHtml(fenceBuffer.join('\n'))}</pre></div>`,
      );
    } else if (fenceBuffer.length > 0) {
      blocks.push(`<pre><code>${escapeHtml(fenceBuffer.join('\n'))}</code></pre>`);
    }
    fenceBuffer = [];
    fenceLang = '';
  };

  for (const line of lines) {
    if (inFence) {
      if (/^```\s*$/.test(line)) {
        inFence = false;
        flushFence();
      } else {
        fenceBuffer.push(line);
      }
      continue;
    }

    const fenceMatch = /^```(\S*)\s*$/.exec(line);
    if (fenceMatch) {
      flushParagraph();
      flushList();
      flushBlockquote();
      inFence = true;
      fenceLang = fenceMatch[1] ?? '';
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    const unorderedMatch = /^[-*]\s+(.*)$/.exec(line);
    const orderedMatch = /^\d+\.\s+(.*)$/.exec(line);
    const blockquoteMatch = /^>\s?(.*)$/.exec(line);
    const isHr = /^(-{3,}|\*{3,})\s*$/.test(line.trim());

    if (headingMatch) {
      flushParagraph();
      flushList();
      flushBlockquote();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const idAttr = options.headingIds ? ` id="${slugify(text)}"` : '';
      blocks.push(`<h${level}${idAttr}>${renderInline(text)}</h${level}>`);
    } else if (isHr) {
      flushParagraph();
      flushList();
      flushBlockquote();
      blocks.push('<hr>');
    } else if (blockquoteMatch) {
      flushParagraph();
      flushList();
      blockquoteBuffer.push(blockquoteMatch[1]);
    } else if (unorderedMatch) {
      flushParagraph();
      flushBlockquote();
      if (listTag !== 'ul') flushList();
      listTag = 'ul';
      listBuffer.push(`<li>${renderInline(unorderedMatch[1])}</li>`);
    } else if (orderedMatch) {
      flushParagraph();
      flushBlockquote();
      if (listTag !== 'ol') flushList();
      listTag = 'ol';
      listBuffer.push(`<li>${renderInline(orderedMatch[1])}</li>`);
    } else if (line.trim().length === 0) {
      flushParagraph();
      flushList();
      flushBlockquote();
    } else {
      flushList();
      flushBlockquote();
      paragraphBuffer.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  flushBlockquote();
  if (inFence) {
    // Unterminated fence (malformed input): flush whatever was captured rather than drop it.
    flushFence();
  }

  return blocks.join('\n');
}

@Service()
export class MarkdownRenderService {
  private readonly sanitizer = inject(DomSanitizer);

  /** Renders Markdown to sanitized HTML, safe to bind via `[innerHTML]`. Use this for any
   * Markdown that could contain user- or CMS-contributor-submitted content (the original use
   * case: the CMS content preview). Angular's `DomSanitizer` strips `id` (it is not on its
   * `VALID_ATTRS` allowlist — confirmed by inspecting `@angular/core`'s sanitizer), so
   * heading anchors requested via `{ headingIds: true }` are silently removed by this method;
   * use `renderTrustedToSafeHtml` when anchors must survive. */
  renderToSafeHtml(markdown: string, options?: MarkdownRenderOptions): string {
    const unsafeHtml = markdownToUnsafeHtml(markdown, options);
    return this.sanitizer.sanitize(SecurityContext.HTML, unsafeHtml) ?? '';
  }

  /** Renders Markdown to HTML for **trusted, non-user-submitted** sources only (e.g. the Livre
   * Blanc's Markdown file, versioned in this repo's own `content/` folder) — bypasses
   * `DomSanitizer` via `bypassSecurityTrustHtml` so that `{ headingIds: true }`'s `id`
   * attributes (stripped by `renderToSafeHtml`, see its comment) survive and can be used as
   * in-page anchors. Never call this with Markdown that could originate from an untrusted
   * source (CMS contributions, user profiles, etc.) — use `renderToSafeHtml` there instead. */
  renderTrustedToSafeHtml(markdown: string, options?: MarkdownRenderOptions): SafeHtml {
    const unsafeHtml = markdownToUnsafeHtml(markdown, options);
    return this.sanitizer.bypassSecurityTrustHtml(unsafeHtml);
  }
}
