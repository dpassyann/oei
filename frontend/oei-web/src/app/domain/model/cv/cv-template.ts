export interface CvTemplate {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly previewUrl?: string;
}

export function createCvTemplate(fields: CvTemplate): CvTemplate {
  return Object.freeze({ ...fields });
}
