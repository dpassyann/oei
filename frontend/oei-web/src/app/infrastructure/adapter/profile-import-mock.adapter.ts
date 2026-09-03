import { Service } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { ProfileImportPort } from '../../domain/port/profile/profile-import.port';
import { ProfileImport } from '../../domain/model/profile/profile-import';
import { ProfessionalProfile } from '../../domain/model/profile/professional-profile';
import { DEMO_PROFESSIONAL_PROFILE } from './professional-profile-mock.adapter';

// Simulates async AI processing: starts at DOCUMENT_UPLOADED, transitions through
// EXTRACTING → AI_PROCESSING → REVIEW_REQUIRED over a few seconds.
const MOCK_PROCESSING_STEPS: Array<Partial<ProfileImport>> = [
  { status: 'DOCUMENT_UPLOADED', processingStepLabel: 'Document reçu…' },
  { status: 'EXTRACTING', processingStepLabel: 'Lecture de votre CV…' },
  { status: 'AI_PROCESSING', processingStepLabel: `Structuration de votre parcours par l'IA…` },
  { status: 'REVIEW_REQUIRED', processingStepLabel: 'Votre profil est prêt à être validé' },
];

let mockImportStore: Map<string, ProfileImport> = new Map();
let mockDraftStore: Map<string, ProfessionalProfile> = new Map();

function createMockImport(file: File): ProfileImport {
  const ext = file.name.toLowerCase().endsWith('.docx') ? 'CV_DOCX' : 'CV_PDF';
  return {
    id: `mock-import-${crypto.randomUUID()}`,
    memberId: 'demo-member-1',
    source: ext,
    status: 'DOCUMENT_UPLOADED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    processingStepLabel: 'Document reçu…',
  };
}

@Service()
export class ProfileImportMockAdapter extends ProfileImportPort {

  override initiateCvImport(file: File, _consentVersion: string): Observable<ProfileImport> {
    const imp = createMockImport(file);
    mockImportStore.set(imp.id, imp);

    // Simulate async progression through processing states
    this.simulateProcessing(imp.id);

    return of(imp);
  }

  override getImport(importId: string): Observable<ProfileImport> {
    const imp = mockImportStore.get(importId);
    if (!imp) {
      throw new Error(`Mock import not found: ${importId}`);
    }
    return of(imp);
  }

  override getImportDraft(importId: string): Observable<ProfessionalProfile> {
    const draft = mockDraftStore.get(importId) ?? {
      ...DEMO_PROFESSIONAL_PROFILE,
      source: 'CV_IMPORTED' as const,
    };
    return of(draft);
  }

  override updateImportDraft(importId: string, draft: ProfessionalProfile): Observable<ProfessionalProfile> {
    mockDraftStore.set(importId, draft);
    return of(draft);
  }

  override confirmImport(importId: string): Observable<ProfessionalProfile> {
    const imp = mockImportStore.get(importId);
    if (imp) {
      mockImportStore.set(importId, { ...imp, status: 'COMPLETED' });
    }
    const profile = mockDraftStore.get(importId) ?? {
      ...DEMO_PROFESSIONAL_PROFILE,
      source: 'CV_IMPORTED' as const,
    };
    return of(profile);
  }

  override importLinkedinBasicFromAuthorizationCode(
    _authorizationCode: string,
    _redirectUri: string,
  ): Observable<ProfessionalProfile> {
    return of({
      ...DEMO_PROFESSIONAL_PROFILE,
      source: 'LINKEDIN_BASIC' as const,
    });
  }

  private simulateProcessing(importId: string): void {
    // Simulate 3s, 6s, 9s, 12s transitions
    MOCK_PROCESSING_STEPS.forEach((step, index) => {
      const delayMs = (index + 1) * 3000;
      timer(delayMs).subscribe(() => {
        const current = mockImportStore.get(importId);
        if (current && current.status !== 'COMPLETED' && current.status !== 'FAILED') {
          mockImportStore.set(importId, {
            ...current,
            ...step,
            updatedAt: new Date().toISOString(),
          } as ProfileImport);
        }
      });
    });
  }
}

