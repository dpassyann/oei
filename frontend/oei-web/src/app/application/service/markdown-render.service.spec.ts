import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  extractHeadings,
  markdownToUnsafeHtml,
  MarkdownRenderService,
  slugify,
  stripFrontmatter,
} from './markdown-render.service';

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

  it('givenBlockquote_whenRendered_thenProducesBlockquote', () => {
    const html = markdownToUnsafeHtml('> Une citation importante.');

    expect(html).toBe('<blockquote><p>Une citation importante.</p></blockquote>');
  });

  it('givenHorizontalRule_whenRendered_thenProducesHr', () => {
    const html = markdownToUnsafeHtml('Avant\n\n---\n\nAprès');

    expect(html).toBe('<p>Avant</p>\n<hr>\n<p>Après</p>');
  });

  it('givenMermaidFencedBlock_whenRendered_thenProducesLabelledDiagramBoxWithRawSource', () => {
    const html = markdownToUnsafeHtml('```mermaid\nflowchart LR\n  A --> B\n```');

    expect(html).toContain('class="markdown-diagram"');
    expect(html).toContain('flowchart LR');
    expect(html).toContain('A --&gt; B');
  });

  it('givenGenericFencedCodeBlock_whenRendered_thenProducesPreCode', () => {
    const html = markdownToUnsafeHtml('```\nconst x = 1;\n```');

    expect(html).toBe('<pre><code>const x = 1;</code></pre>');
  });

  it('givenHeadingIdsOptionEnabled_whenRendered_thenHeadingGetsSlugifiedId', () => {
    const html = markdownToUnsafeHtml('## 1. Pourquoi ce document, pourquoi maintenant', {
      headingIds: true,
    });

    expect(html).toBe(
      '<h2 id="1-pourquoi-ce-document-pourquoi-maintenant">1. Pourquoi ce document, pourquoi maintenant</h2>',
    );
  });

  it('givenHeadingIdsOptionDisabled_whenRendered_thenNoIdAttributeIsAdded', () => {
    const html = markdownToUnsafeHtml('## Titre');

    expect(html).toBe('<h2>Titre</h2>');
  });
});

describe('slugify', () => {
  it('givenTextWithNumberingPunctuationAndAccents_whenSlugified_thenProducesLowerKebabCase', () => {
    expect(slugify('1. Pourquoi ce document, pourquoi maintenant')).toBe(
      '1-pourquoi-ce-document-pourquoi-maintenant',
    );
    expect(slugify('À propos de l’OEI')).toBe('a-propos-de-loei');
  });
});

describe('stripFrontmatter', () => {
  it('givenLeadingYamlFrontmatter_whenStripped_thenRemovesItAndKeepsBody', () => {
    const markdown = '---\ntitle: "Livre Blanc"\nversion: "v3"\n---\n\n# Livre Blanc\n\nCorps.';

    expect(stripFrontmatter(markdown)).toBe('# Livre Blanc\n\nCorps.');
  });

  it('givenNoFrontmatter_whenStripped_thenReturnsInputUnchanged', () => {
    const markdown = '# Livre Blanc\n\nCorps.';

    expect(stripFrontmatter(markdown)).toBe(markdown);
  });
});

describe('extractHeadings', () => {
  it('givenMixedHeadingLevels_whenExtractingLevelTwo_thenReturnsOnlyThoseWithMatchingSlug', () => {
    const markdown = '# Livre Blanc\n\n## 1. Introduction\n\n### Sous-partie\n\n## 2. Conclusion';

    const headings = extractHeadings(markdown, [2]);

    expect(headings).toEqual([
      { level: 2, text: '1. Introduction', slug: '1-introduction' },
      { level: 2, text: '2. Conclusion', slug: '2-conclusion' },
    ]);
  });

  it('givenHeadingLookingTextInsideFencedCodeBlock_whenExtracting_thenIgnoresIt', () => {
    const markdown = '## Réel\n\n```\n## Pas un titre\n```\n\n## Aussi réel';

    const headings = extractHeadings(markdown, [2]);

    expect(headings.map((h) => h.text)).toEqual(['Réel', 'Aussi réel']);
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
