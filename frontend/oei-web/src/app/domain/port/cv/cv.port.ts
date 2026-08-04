import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Cv, CvCreation, CvRenderRequest, CvSection, CvTranslation, PdfGenerationJob } from '../../model/cv/cv';
import { CvTemplate } from '../../model/cv/cv-template';

export interface CvPort {
  listTemplates(): Observable<CvTemplate[]>;
  listCvs(): Observable<Cv[]>;
  getCv(id: string): Observable<Cv>;
  createCv(creation: CvCreation): Observable<Cv>;
  updateCv(id: string, cv: Cv): Observable<Cv>;
  addSection(cvId: string, section: Omit<CvSection, 'id' | 'cvId' | 'translations'>): Observable<CvSection>;
  updateSection(cvId: string, sectionId: string, section: CvSection): Observable<CvSection>;
  addTranslation(
    cvId: string,
    sectionId: string,
    translation: Pick<CvTranslation, 'language' | 'content'>,
  ): Observable<CvTranslation>;
  validateTranslation(cvId: string, sectionId: string, language: string): Observable<CvTranslation>;
  // Mocked PDF generation: never a real HTML→PDF render engine in V1 — returns a job
  // that resolves (synchronously, in the mock adapter) to a static mock PDF/blob URL.
  renderCv(cvId: string, request: CvRenderRequest): Observable<PdfGenerationJob>;
}

export const CV_PORT = new InjectionToken<CvPort>('CvPort');
