import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { markdownToUnsafeHtml, MarkdownRenderService } from './markdown-render.service';

describe('markdownToUnsafeHtml', () => {
  it('givenHeadingAndParagraph_whenRendered_thenProducesExpectedTags', () => {
    const html = markdownToUnsafeHtml('# Titre\n\nUn paragraphe.');

    expect(html).toBe('<h1>Titre</h1>\n<p>Un paragraphe.</p>');
  });

  it('givenBoldItalicAndCode_whenRendered_thenAppliesInlineFormatting', () => {
    const html = markdownToUnsafeHtml('**gras** et *italique* et `code`');

    expect(html).toBe('<p><strong>gras</strong> et <em>italique</em> et <code>code</code></p>');
  });

  it('givenUnorderedList_whenRendered_thenProducesUlLi', () => {
    const html = markdownToUnsafeHtml('- un\n- deux');

    expect(html).toBe('<ul><li>un</li><li>deux</li></ul>');
  });

  it('givenLink_whenRendered_thenProducesAnchor', () => {
    const html = markdownToUnsafeHtml('[OEI](https://oei.example)');

    expect(html).toBe('<p><a href="https://oei.example">OEI</a></p>');
  });

  it('givenHtmlInjectionAttempt_whenRendered_thenEscapesRawHtml', () => {
    const html = markdownToUnsafeHtml('<script>alert(1)</script>');

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('MarkdownRenderService', () => {
  function createService(): MarkdownRenderService {
    TestBed.configureTestingModule({});
    return TestBed.inject(MarkdownRenderService);
  }

  it('givenScriptTag_whenRenderedToSafeHtml_thenNoExecutableScriptElementIsProduced', () => {
    const service = createService();

    const safeHtml = service.renderToSafeHtml('Texte <script>alert(1)</script> normal.');

    // The Markdown renderer already HTML-escapes raw `<script>` as text (see
    // `markdownToUnsafeHtml`'s `escapeHtml`), and `DomSanitizer` only strips unsafe *markup*, not
    // harmless escaped text content — so `alert(1)` may still appear as inert, escaped text.
    // What matters for the "no unsanitized `[innerHTML]`" security requirement is that no live
    // `<script>` element is ever produced.
    expect(safeHtml).not.toContain('<script>');
    expect(safeHtml).toContain('&lt;script&gt;');
  });

  it('givenRawHtmlEventHandlerAttempt_whenRenderedToSafeHtml_thenSanitizerStripsUnsafeMarkup', () => {
    const service = createService();

    // Bypasses this service's own Markdown escaping to exercise the sanitizer itself: simulates
    // what would happen if raw HTML ever reached `[innerHTML]` unescaped.
    const safeHtml = TestBed.inject(MarkdownRenderService)['sanitizer'].sanitize(
      SecurityContext.HTML,
      '<img src="x" onerror="alert(1)">',
    );

    expect(safeHtml).not.toContain('onerror');
  });

  it('givenPlainMarkdown_whenRenderedToSafeHtml_thenKeepsSafeTags', () => {
    const service = createService();

    const safeHtml = service.renderToSafeHtml('# Titre\n\nCorps.');

    expect(safeHtml).toContain('<h1>Titre</h1>');
    expect(safeHtml).toContain('<p>Corps.</p>');
  });
});
