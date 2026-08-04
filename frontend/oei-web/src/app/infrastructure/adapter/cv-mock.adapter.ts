import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CvPort } from '../../domain/port/cv/cv.port';
import {
  Cv,
  CvCreation,
  CvRenderRequest,
  CvSection,
  CvTranslation,
  PdfGenerationJob,
  createCv,
  createPdfGenerationJob,
} from '../../domain/model/cv/cv';
import { CvTemplate, createCvTemplate } from '../../domain/model/cv/cv-template';

// Same demonstration member as the rest of the mocked member space
// (see member-mock.adapter.ts DEMO_MEMBER) — never presented as a real account.
const DEMO_MEMBER_ID = 'demo-member-1';

const DEMO_TEMPLATES: CvTemplate[] = [
  createCvTemplate({ id: 'tpl-classic', code: 'CLASSIC', name: 'Classique' }),
  createCvTemplate({ id: 'tpl-modern', code: 'MODERN', name: 'Moderne' }),
];

@Service()
export class CvMockAdapter implements CvPort {
  // In-memory mutable store, seeded with one demo CV — re-created per adapter instance,
  // no cross-instance persistence needed for the mock.
  private cvs: Cv[] = [
    createCv({
      id: 'demo-cv-1',
      memberId: DEMO_MEMBER_ID,
      templateId: 'tpl-classic',
      sourceLanguage: 'fr',
      status: 'DRAFT',
      sections: [
        {
          id: 'demo-section-identity',
          cvId: 'demo-cv-1',
          type: 'IDENTITY',
          order: 0,
          content: { fullName: 'Jane Dupont (Démonstration)' },
          translations: [],
        },
        {
          id: 'demo-section-summary',
          cvId: 'demo-cv-1',
          type: 'SUMMARY',
          order: 1,
          content: { text: 'Résumé de démonstration.' },
          translations: [],
        },
      ],
    }),
  ];

  listTemplates(): Observable<CvTemplate[]> {
    return of(DEMO_TEMPLATES);
  }

  listCvs(): Observable<Cv[]> {
    return of(this.cvs);
  }

  getCv(id: string): Observable<Cv> {
    return of(this.findCvOrThrow(id));
  }

  createCv(creation: CvCreation): Observable<Cv> {
    const cv = createCv({
      id: crypto.randomUUID(),
      memberId: DEMO_MEMBER_ID,
      templateId: creation.templateId,
      sourceLanguage: creation.sourceLanguage,
      status: 'DRAFT',
      sections: [],
    });
    this.cvs = [...this.cvs, cv];
    return of(cv);
  }

  updateCv(id: string, cv: Cv): Observable<Cv> {
    const updated = createCv({ ...cv, id });
    this.cvs = this.cvs.map((existing) => (existing.id === id ? updated : existing));
    return of(updated);
  }

  addSection(cvId: string, section: Omit<CvSection, 'id' | 'cvId' | 'translations'>): Observable<CvSection> {
    const newSection: CvSection = { ...section, id: crypto.randomUUID(), cvId, translations: [] };
    this.mutateCv(cvId, (cv) => ({ ...cv, sections: [...cv.sections, newSection] }));
    return of(newSection);
  }

  updateSection(cvId: string, sectionId: string, section: CvSection): Observable<CvSection> {
    const updatedSection: CvSection = { ...section, id: sectionId, cvId };
    this.mutateCv(cvId, (cv) => ({
      ...cv,
      sections: cv.sections.map((existing) => (existing.id === sectionId ? updatedSection : existing)),
    }));
    return of(updatedSection);
  }

  addTranslation(
    cvId: string,
    sectionId: string,
    translation: Pick<CvTranslation, 'language' | 'content'>,
  ): Observable<CvTranslation> {
    // Automatic translation stays flagged as MACHINE_GENERATED until a human validates
    // it — never auto-VALIDATED, matches the spec requirement.
    const newTranslation: CvTranslation = {
      id: crypto.randomUUID(),
      sectionId,
      language: translation.language,
      content: translation.content,
      status: 'MACHINE_GENERATED',
      translatedAt: new Date().toISOString(),
    };
    this.mutateCv(cvId, (cv) => ({
      ...cv,
      sections: cv.sections.map((section) =>
        section.id === sectionId ? { ...section, translations: [...section.translations, newTranslation] } : section,
      ),
    }));
    return of(newTranslation);
  }

  validateTranslation(cvId: string, sectionId: string, language: string): Observable<CvTranslation> {
    const cv = this.findCvOrThrow(cvId);
    const section = cv.sections.find((candidate) => candidate.id === sectionId);
    const translation = section?.translations.find((candidate) => candidate.language === language);
    if (!section || !translation) {
      throw new Error(`Translation not found for cv=${cvId} section=${sectionId} language=${language}`);
    }
    const validated: CvTranslation = { ...translation, status: 'VALIDATED', validatedBy: DEMO_MEMBER_ID };
    this.mutateCv(cvId, (currentCv) => ({
      ...currentCv,
      sections: currentCv.sections.map((candidateSection) =>
        candidateSection.id === sectionId
          ? {
              ...candidateSection,
              translations: candidateSection.translations.map((candidateTranslation) =>
                candidateTranslation.language === language ? validated : candidateTranslation,
              ),
            }
          : candidateSection,
      ),
    }));
    return of(validated);
  }

  renderCv(cvId: string, _request: CvRenderRequest): Observable<PdfGenerationJob> {
    // Mocked PDF generation — NOT a real HTML→PDF engine. Synchronously resolves to a
    // static mock asset path; no actual file is required to exist for the mock to work.
    const now = new Date().toISOString();
    return of(
      createPdfGenerationJob({
        id: crypto.randomUUID(),
        targetType: 'CV',
        targetId: cvId,
        status: 'DONE',
        resultUrl: '/assets/mock/demo-cv.pdf',
        requestedAt: now,
        completedAt: now,
      }),
    );
  }

  private findCvOrThrow(id: string): Cv {
    const cv = this.cvs.find((candidate) => candidate.id === id);
    if (!cv) {
      throw new Error(`Cv not found: ${id}`);
    }
    return cv;
  }

  private mutateCv(cvId: string, mutate: (cv: Cv) => Cv): void {
    this.cvs = this.cvs.map((existing) => (existing.id === cvId ? createCv(mutate(existing)) : existing));
  }
}
