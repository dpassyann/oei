import { Service, inject, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

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

/** Converts a small, deliberately-limited Markdown subset (headings, paragraphs, bold/italic/
 * code, links, unordered/ordered lists) into raw (unsanitized) HTML. */
export function markdownToUnsafeHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let listTag: 'ul' | 'ol' | null = null;

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

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    const unorderedMatch = /^[-*]\s+(.*)$/.exec(line);
    const orderedMatch = /^\d+\.\s+(.*)$/.exec(line);

    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
    } else if (unorderedMatch) {
      flushParagraph();
      if (listTag !== 'ul') flushList();
      listTag = 'ul';
      listBuffer.push(`<li>${renderInline(unorderedMatch[1])}</li>`);
    } else if (orderedMatch) {
      flushParagraph();
      if (listTag !== 'ol') flushList();
      listTag = 'ol';
      listBuffer.push(`<li>${renderInline(orderedMatch[1])}</li>`);
    } else if (line.trim().length === 0) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraphBuffer.push(line.trim());
    }
  }
  flushParagraph();
  flushList();

  return blocks.join('\n');
}

@Service()
export class MarkdownRenderService {
  private readonly sanitizer = inject(DomSanitizer);

  /** Renders Markdown to sanitized HTML, safe to bind via `[innerHTML]`. */
  renderToSafeHtml(markdown: string): string {
    const unsafeHtml = markdownToUnsafeHtml(markdown);
    return this.sanitizer.sanitize(SecurityContext.HTML, unsafeHtml) ?? '';
  }
}
