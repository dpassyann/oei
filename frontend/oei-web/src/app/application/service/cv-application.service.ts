import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CV_PORT } from '../../domain/port/cv/cv.port';
import { Cv, CvCreation, CvRenderRequest, CvSection, CvTranslation, PdfGenerationJob } from '../../domain/model/cv/cv';
import { CvTemplate } from '../../domain/model/cv/cv-template';

@Service()
export class CvApplicationService {
  private readonly port = inject(CV_PORT);

  listTemplates(): Observable<CvTemplate[]> {
    return this.port.listTemplates();
  }

  listCvs(): Observable<Cv[]> {
    return this.port.listCvs();
  }

  getCv(id: string): Observable<Cv> {
    return this.port.getCv(id);
  }

  createCv(creation: CvCreation): Observable<Cv> {
    return this.port.createCv(creation);
  }

  updateCv(id: string, cv: Cv): Observable<Cv> {
    return this.port.updateCv(id, cv);
  }

  addSection(cvId: string, section: Omit<CvSection, 'id' | 'cvId' | 'translations'>): Observable<CvSection> {
    return this.port.addSection(cvId, section);
  }

  updateSection(cvId: string, sectionId: string, section: CvSection): Observable<CvSection> {
    return this.port.updateSection(cvId, sectionId, section);
  }

  addTranslation(
    cvId: string,
    sectionId: string,
    translation: Pick<CvTranslation, 'language' | 'content'>,
  ): Observable<CvTranslation> {
    return this.port.addTranslation(cvId, sectionId, translation);
  }

  validateTranslation(cvId: string, sectionId: string, language: string): Observable<CvTranslation> {
    return this.port.validateTranslation(cvId, sectionId, language);
  }

  renderCv(cvId: string, request: CvRenderRequest): Observable<PdfGenerationJob> {
    return this.port.renderCv(cvId, request);
  }
}
