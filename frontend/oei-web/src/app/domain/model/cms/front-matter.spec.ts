import { describe, expect, it } from 'vitest';
import { parseAndValidateFrontMatter, splitFrontMatter, validateFrontMatter, FrontMatterParseError } from './front-matter';

const VALID_DOCUMENT = `---
id: oei-whitepaper
type: whitepaper
title: "Livre Blanc"
slug: "livre-blanc"
version: "1.0"
status: published
language: fr
sourceLanguage: fr
effectiveDate: 2026-08-01
authors:
  - yann-deungoue
governance:
  approvalRequired: true
  decisionId: DEC-2026-001
translations:
  en: pending
---

# Livre Blanc

Corps du document.
`;

describe('splitFrontMatter', () => {
  it('givenDocumentWithFrontMatter_whenSplit_thenReturnsParsedMapAndBody', () => {
    const { frontMatter, body } = splitFrontMatter(VALID_DOCUMENT);

    expect(frontMatter['id']).toBe('oei-whitepaper');
    expect(frontMatter['type']).toBe('whitepaper');
    expect(frontMatter['title']).toBe('Livre Blanc');
    expect(frontMatter['slug']).toBe('livre-blanc');
    expect(frontMatter['version']).toBe('1.0');
    expect(frontMatter['status']).toBe('published');
    expect(frontMatter['authors']).toEqual(['yann-deungoue']);
    expect(frontMatter['governance']).toEqual({ approvalRequired: true, decisionId: 'DEC-2026-001' });
    expect(frontMatter['translations']).toEqual({ en: 'pending' });
    expect(body.trim()).toBe('# Livre Blanc\n\nCorps du document.');
  });

  it('givenDocumentWithoutOpeningDelimiter_whenSplit_thenThrows', () => {
    expect(() => splitFrontMatter('# No front matter here')).toThrow(FrontMatterParseError);
  });

  it('givenDocumentWithUnterminatedFrontMatter_whenSplit_thenThrows', () => {
    expect(() => splitFrontMatter('---\nid: x\n')).toThrow(FrontMatterParseError);
  });

  it('givenMalformedLine_whenSplit_thenThrows', () => {
    expect(() => splitFrontMatter('---\nnot a key value line\n---\nbody\n')).toThrow(FrontMatterParseError);
  });
});

describe('validateFrontMatter', () => {
  it('givenValidFrontMatter_whenValidated_thenReturnsNormalizedTypedFrontMatter', () => {
    const { frontMatter } = splitFrontMatter(VALID_DOCUMENT);
    const result = validateFrontMatter(frontMatter);

    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error('expected valid');
    expect(result.frontMatter.type).toBe('WHITEPAPER');
    expect(result.frontMatter.status).toBe('PUBLISHED');
    expect(result.frontMatter.authors).toEqual(['yann-deungoue']);
    expect(result.frontMatter.governance).toEqual({ approvalRequired: true, decisionId: 'DEC-2026-001' });
    expect(result.frontMatter.translations).toEqual({ en: 'pending' });
  });

  it('givenMissingRequiredFields_whenValidated_thenReturnsAllErrors', () => {
    const result = validateFrontMatter({});

    expect(result.valid).toBe(false);
    if (result.valid) throw new Error('expected invalid');
    const fields = result.errors.map((error) => error.field);
    expect(fields).toContain('id');
    expect(fields).toContain('type');
    expect(fields).toContain('title');
    expect(fields).toContain('slug');
    expect(fields).toContain('version');
    expect(fields).toContain('status');
    expect(fields).toContain('language');
    expect(fields).toContain('sourceLanguage');
    expect(fields).toContain('effectiveDate');
    expect(fields).toContain('authors');
    expect(fields).toContain('governance');
  });

  it('givenUnknownContentType_whenValidated_thenReportsTypeError', () => {
    const result = validateFrontMatter({
      id: 'x',
      type: 'not-a-type',
      title: 'T',
      slug: 'slug',
      version: '1.0',
      status: 'draft',
      language: 'fr',
      sourceLanguage: 'fr',
      effectiveDate: '2026-01-01',
      authors: ['a'],
      governance: { approvalRequired: false, decisionId: null },
    });

    expect(result.valid).toBe(false);
    if (result.valid) throw new Error('expected invalid');
    expect(result.errors.some((error) => error.field === 'type')).toBe(true);
  });

  it('givenNonKebabCaseSlug_whenValidated_thenReportsSlugError', () => {
    const result = validateFrontMatter({
      id: 'x',
      type: 'page',
      title: 'T',
      slug: 'Not A Slug',
      version: '1.0',
      status: 'draft',
      language: 'fr',
      sourceLanguage: 'fr',
      effectiveDate: '2026-01-01',
      authors: ['a'],
      governance: { approvalRequired: false, decisionId: null },
    });

    expect(result.valid).toBe(false);
    if (result.valid) throw new Error('expected invalid');
    expect(result.errors.some((error) => error.field === 'slug')).toBe(true);
  });

  it('givenInvalidEffectiveDate_whenValidated_thenReportsDateError', () => {
    const result = validateFrontMatter({
      id: 'x',
      type: 'page',
      title: 'T',
      slug: 'slug',
      version: '1.0',
      status: 'draft',
      language: 'fr',
      sourceLanguage: 'fr',
      effectiveDate: '01/01/2026',
      authors: ['a'],
      governance: { approvalRequired: false, decisionId: null },
    });

    expect(result.valid).toBe(false);
    if (result.valid) throw new Error('expected invalid');
    expect(result.errors.some((error) => error.field === 'effectiveDate')).toBe(true);
  });

  it('givenMissingTranslations_whenValidated_thenDefaultsToEmptyMap', () => {
    const result = validateFrontMatter({
      id: 'x',
      type: 'page',
      title: 'T',
      slug: 'slug',
      version: '1.0',
      status: 'draft',
      language: 'fr',
      sourceLanguage: 'fr',
      effectiveDate: '2026-01-01',
      authors: ['a'],
      governance: { approvalRequired: false, decisionId: null },
    });

    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error('expected valid');
    expect(result.frontMatter.translations).toEqual({});
  });
});

describe('parseAndValidateFrontMatter', () => {
  it('givenFullDocument_whenParsedAndValidated_thenReturnsFrontMatterAndBody', () => {
    const result = parseAndValidateFrontMatter(VALID_DOCUMENT);

    expect(result.valid).toBe(true);
    expect(result.body.trim()).toBe('# Livre Blanc\n\nCorps du document.');
  });
});
