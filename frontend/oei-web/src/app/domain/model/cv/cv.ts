// The 13 manual sections required by the functional spec ("CV Builder — Sections
// manuelles"). Import/extraction from PDF/DOCX is explicitly future scope and, per the
// spec, must never auto-publish extracted content — not modeled here.
export type CvSectionType =
  | 'IDENTITY'
  | 'SUMMARY'
  | 'EXPERIENCE'
  | 'PROJECT'
  | 'EDUCATION'
  | 'CERTIFICATION'
  | 'SKILL'
  | 'LANGUAGE'
  | 'PUBLICATION'
  | 'CONFERENCE'
  | 'ENGAGEMENT'
  | 'DISTINCTION'
  | 'REFERENCE';

export const CV_SECTION_TYPES: readonly CvSectionType[] = [
  'IDENTITY',
  'SUMMARY',
  'EXPERIENCE',
  'PROJECT',
  'EDUCATION',
  'CERTIFICATION',
  'SKILL',
  'LANGUAGE',
  'PUBLICATION',
  'CONFERENCE',
  'ENGAGEMENT',
  'DISTINCTION',
  'REFERENCE',
];

// A translation stays flagged as machine-generated (never silently treated as
// human-validated) until a person explicitly validates it — spec requirement
// "Une traduction automatique reste signalée tant qu'elle n'est pas validée."
export type CvTranslationStatus = 'MACHINE_GENERATED' | 'PENDING_VALIDATION' | 'VALIDATED';

export interface CvTranslation {
  readonly id: string;
  readonly sectionId: string;
  readonly language: string;
  readonly content: Readonly<Record<string, unknown>>;
  readonly status: CvTranslationStatus;
  readonly translatedAt: string;
  readonly validatedBy?: string | null;
}

export interface CvSection {
  readonly id: string;
  readonly cvId: string;
  readonly type: CvSectionType;
  readonly order: number;
  readonly content: Readonly<Record<string, unknown>>;
  readonly translations: readonly CvTranslation[];
}

export type CvStatus = 'DRAFT' | 'READY';

export interface CvCreation {
  readonly templateId: string;
  readonly sourceLanguage: string;
}

export interface Cv extends CvCreation {
  readonly id: string;
  readonly memberId: string;
  readonly status: CvStatus;
  readonly sections: readonly CvSection[];
}

export function createCv(fields: Cv): Cv {
  return Object.freeze({ ...fields });
}

export interface CvRenderRequest {
  readonly language: string;
  readonly includeBadges: readonly string[];
}

export type PdfGenerationJobStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';

export interface PdfGenerationJob {
  readonly id: string;
  readonly targetType: 'CV' | 'BOOK';
  readonly targetId: string;
  readonly status: PdfGenerationJobStatus;
  readonly resultUrl?: string | null;
  readonly requestedAt: string;
  readonly completedAt?: string | null;
}

export function createPdfGenerationJob(fields: PdfGenerationJob): PdfGenerationJob {
  return Object.freeze({ ...fields });
}
