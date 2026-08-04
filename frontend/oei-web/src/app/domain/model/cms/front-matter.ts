// Front matter parser/validator for the Markdown documents synced from the normative Git
// repository (mocked in this plan). Matches the YAML example in the "Front matter" section of
// `.prompt/plan/04-PROMPT-CMS-GOUVERNANCE-DOCUMENTAIRE.md`:
//
// ---
// id: oei-whitepaper
// type: whitepaper
// title: "Livre Blanc"
// slug: "livre-blanc"
// version: "1.0"
// status: published
// language: fr
// sourceLanguage: fr
// effectiveDate: 2026-08-01
// authors:
//   - yann-deungoue
// governance:
//   approvalRequired: true
//   decisionId: DEC-2026-001
// translations:
//   en: pending
// ---
//
// No dependency was added: `package.json` has no YAML/front-matter library installed (checked
// before writing this), so this is a deliberately minimal, indentation-based parser covering only
// the subset of YAML actually used by OEI front matter (scalars, quoted strings, booleans,
// one-level nested maps, and `- item` lists) — not a general-purpose YAML implementation.
import { ContentType, isContentType } from './content-type';
import { ContentWorkflowStatus, CONTENT_WORKFLOW_STATUS_VALUES } from './content.model';

export interface ContentFrontMatter {
  readonly id: string;
  readonly type: ContentType;
  readonly title: string;
  readonly slug: string;
  readonly version: string;
  readonly status: ContentWorkflowStatus;
  readonly language: string;
  readonly sourceLanguage: string;
  readonly effectiveDate: string;
  readonly authors: readonly string[];
  readonly governance: { readonly approvalRequired: boolean; readonly decisionId: string | null };
  readonly translations: Readonly<Record<string, string>>;
}

export interface ParsedMarkdownDocument {
  readonly frontMatter: Record<string, unknown>;
  readonly body: string;
}

const FRONT_MATTER_DELIMITER = '---';

/** Splits a Markdown document with YAML-subset front matter into its raw (untyped) key/value
 * map and the Markdown body. Throws if the document has no front matter block. */
export function splitFrontMatter(raw: string): ParsedMarkdownDocument {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  if (lines[0]?.trim() !== FRONT_MATTER_DELIMITER) {
    throw new FrontMatterParseError('Document has no front matter: expected the first line to be "---".');
  }
  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === FRONT_MATTER_DELIMITER);
  if (closingIndex === -1) {
    throw new FrontMatterParseError('Unterminated front matter block: missing closing "---".');
  }
  const frontMatterLines = lines.slice(1, closingIndex);
  const body = lines
    .slice(closingIndex + 1)
    .join('\n')
    .replace(/^\n+/, '');
  return { frontMatter: parseYamlSubset(frontMatterLines), body };
}

export class FrontMatterParseError extends Error {}

function indentOf(line: string): number {
  return line.length - line.trimStart().length;
}

function parseScalar(raw: string): string | boolean {
  const trimmed = raw.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2)
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/** Parses a block of lines at a uniform indentation level into a nested plain object, handling
 * `key: value`, `key:` + nested map, and `key:` + `- item` list. Recursive on indentation. */
function parseYamlSubset(lines: readonly string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const meaningfulLines = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.trim().length > 0 && !line.trim().startsWith('#'));
  if (meaningfulLines.length === 0) {
    return result;
  }
  const baseIndent = indentOf(meaningfulLines[0].line);

  let i = 0;
  while (i < meaningfulLines.length) {
    const { line } = meaningfulLines[i];
    const indent = indentOf(line);
    if (indent !== baseIndent) {
      throw new FrontMatterParseError(`Unexpected indentation on line: "${line}"`);
    }
    const trimmed = line.trim();
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      throw new FrontMatterParseError(`Expected a "key: value" pair, got: "${line}"`);
    }
    const key = trimmed.slice(0, colonIndex).trim();
    const rest = trimmed.slice(colonIndex + 1).trim();

    if (rest.length > 0) {
      result[key] = parseScalar(rest);
      i += 1;
      continue;
    }

    // No inline value: gather the indented block that follows (either a list or a nested map).
    const blockLines: string[] = [];
    let j = i + 1;
    while (j < meaningfulLines.length && indentOf(meaningfulLines[j].line) > baseIndent) {
      blockLines.push(meaningfulLines[j].line);
      j += 1;
    }
    if (blockLines.length === 0) {
      result[key] = null;
      i = j;
      continue;
    }
    const isList = blockLines.every((blockLine) => blockLine.trim().startsWith('- '));
    if (isList) {
      result[key] = blockLines.map((blockLine) => parseScalar(blockLine.trim().slice(2)));
    } else {
      result[key] = parseYamlSubset(blockLines);
    }
    i = j;
  }
  return result;
}

export interface FrontMatterValidationError {
  readonly field: string;
  readonly message: string;
}

export type FrontMatterValidationResult =
  | { readonly valid: true; readonly frontMatter: ContentFrontMatter }
  | { readonly valid: false; readonly errors: readonly FrontMatterValidationError[] };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Validates the raw parsed front matter map against the fields required by the CMS
 * (`id`/`type`/`title`/`slug`/`version`/`status`/`language`/`sourceLanguage`/`effectiveDate`/
 * `authors`/`governance`/`translations`), normalizing `type`/`status` to their uppercase enum form. */
export function validateFrontMatter(raw: Record<string, unknown>): FrontMatterValidationResult {
  const errors: FrontMatterValidationError[] = [];

  if (!isNonEmptyString(raw['id'])) errors.push({ field: 'id', message: 'id is required and must be a non-empty string.' });

  const rawType = raw['type'];
  if (!isNonEmptyString(rawType) || !isContentType(rawType)) {
    errors.push({ field: 'type', message: `type must be one of the known ContentType values, got "${String(rawType)}".` });
  }

  if (!isNonEmptyString(raw['title'])) errors.push({ field: 'title', message: 'title is required.' });

  const rawSlug = raw['slug'];
  if (!isNonEmptyString(rawSlug) || !SLUG_PATTERN.test(rawSlug)) {
    errors.push({ field: 'slug', message: `slug must be kebab-case, got "${String(rawSlug)}".` });
  }

  if (!isNonEmptyString(raw['version'])) errors.push({ field: 'version', message: 'version is required.' });

  const rawStatus = raw['status'];
  const normalizedStatus = isNonEmptyString(rawStatus) ? rawStatus.toUpperCase() : undefined;
  if (!normalizedStatus || !(CONTENT_WORKFLOW_STATUS_VALUES as readonly string[]).includes(normalizedStatus)) {
    errors.push({ field: 'status', message: `status must be one of the known workflow statuses, got "${String(rawStatus)}".` });
  }

  if (!isNonEmptyString(raw['language'])) errors.push({ field: 'language', message: 'language is required.' });
  if (!isNonEmptyString(raw['sourceLanguage'])) errors.push({ field: 'sourceLanguage', message: 'sourceLanguage is required.' });

  const rawEffectiveDate = raw['effectiveDate'];
  if (!isNonEmptyString(rawEffectiveDate) || !DATE_PATTERN.test(rawEffectiveDate)) {
    errors.push({ field: 'effectiveDate', message: `effectiveDate must be an ISO date (YYYY-MM-DD), got "${String(rawEffectiveDate)}".` });
  }

  const rawAuthors = raw['authors'];
  if (!Array.isArray(rawAuthors) || rawAuthors.length === 0 || !rawAuthors.every((author) => isNonEmptyString(author))) {
    errors.push({ field: 'authors', message: 'authors must be a non-empty list of author identifiers.' });
  }

  const rawGovernance = raw['governance'];
  let governance: { approvalRequired: boolean; decisionId: string | null } | undefined;
  if (typeof rawGovernance !== 'object' || rawGovernance === null || Array.isArray(rawGovernance)) {
    errors.push({ field: 'governance', message: 'governance must be an object with approvalRequired/decisionId.' });
  } else {
    const g = rawGovernance as Record<string, unknown>;
    if (typeof g['approvalRequired'] !== 'boolean') {
      errors.push({ field: 'governance.approvalRequired', message: 'governance.approvalRequired must be a boolean.' });
    } else {
      governance = { approvalRequired: g['approvalRequired'], decisionId: isNonEmptyString(g['decisionId']) ? g['decisionId'] : null };
    }
  }

  const rawTranslations = raw['translations'];
  let translations: Record<string, string> | undefined;
  if (rawTranslations === undefined || rawTranslations === null) {
    translations = {};
  } else if (typeof rawTranslations !== 'object' || Array.isArray(rawTranslations)) {
    errors.push({ field: 'translations', message: 'translations must be a map of language -> status.' });
  } else {
    translations = rawTranslations as Record<string, string>;
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    frontMatter: {
      id: raw['id'] as string,
      type: (rawType as string).toUpperCase() as ContentType,
      title: raw['title'] as string,
      slug: rawSlug as string,
      version: raw['version'] as string,
      status: normalizedStatus as ContentWorkflowStatus,
      language: raw['language'] as string,
      sourceLanguage: raw['sourceLanguage'] as string,
      effectiveDate: rawEffectiveDate as string,
      authors: [...(rawAuthors as string[])],
      governance: governance as { approvalRequired: boolean; decisionId: string | null },
      translations: { ...(translations as Record<string, string>) },
    },
  };
}

/** Convenience one-shot: parse then validate a full Markdown document with front matter. */
export function parseAndValidateFrontMatter(raw: string): { readonly body: string } & FrontMatterValidationResult {
  const { frontMatter, body } = splitFrontMatter(raw);
  return { ...validateFrontMatter(frontMatter), body };
}
