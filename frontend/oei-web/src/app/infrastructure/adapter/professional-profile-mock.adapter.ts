import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProfessionalProfilePort } from '../../domain/port/profile/professional-profile.port';
import { computeCompletenessScore, ProfessionalProfile } from '../../domain/model/profile/professional-profile';

// Demonstration profile for `demo-member-1` — same memberId as `DEMO_MEMBER` in
// `member-mock.adapter.ts` so the whole mocked member space stays consistent. Experiences
// are explicitly flagged `isDemoData: true` per the spec requirement on honest demo data.
const DEMO_PROFILE_WITHOUT_SCORE = {
  memberId: 'demo-member-1',
  // Reuses the Livre Blanc's demo author photo (`public/assets/livre-blanc/photo-auteur.png`)
  // rather than adding a new binary asset just for this profile — it is already flagged as
  // demonstration imagery elsewhere in the repo, so reusing it here stays honest per the
  // "données de démonstration honnêtes" requirement.
  photoUrl: '/assets/livre-blanc/photo-auteur.png',
  title: 'Experte en éthique de l’intelligence artificielle',
  summary:
    'Consultante spécialisée dans la gouvernance et l’éthique de l’IA, accompagnant des institutions dans la mise en conformité de leurs systèmes d’IA.',
  location: 'Paris, France',
  availability: 'OPEN_TO_OPPORTUNITIES' as const,
  expertiseAreas: ['Gouvernance IA', 'Éthique appliquée', 'Conformité réglementaire'],
  technologies: ['Python', 'TensorFlow'],
  sectors: ['Finance', 'Secteur public'],
  languages: [
    { language: 'fr', level: 'NATIVE' as const },
    { language: 'en', level: 'C1' as const },
  ],
  experiences: [
    {
      id: 'demo-experience-1',
      organization: 'Institut Démonstration IA',
      title: 'Consultante senior en éthique de l’IA',
      startDate: '2023-03-01',
      current: true,
      description: 'Accompagnement de projets de conformité éthique des systèmes d’IA.',
      isDemoData: true,
    },
    {
      id: 'demo-experience-2',
      organization: 'Cabinet Démonstration Conseil',
      title: 'Analyste gouvernance des données',
      startDate: '2020-09-01',
      endDate: '2023-02-28',
      description: 'Audits de conformité RGPD et cartographie des risques algorithmiques.',
      isDemoData: true,
    },
  ],
  educations: [
    {
      id: 'demo-education-1',
      institution: 'Université Démonstration',
      program: 'Master Éthique et Numérique',
      startDate: '2018-09-01',
      endDate: '2020-06-30',
    },
  ],
  skills: [
    { id: 'demo-skill-1', name: 'Audit algorithmique', category: 'Gouvernance', verified: false },
    { id: 'demo-skill-2', name: 'Analyse de risques éthiques', category: 'Gouvernance', verified: false },
    { id: 'demo-skill-3', name: 'Réglementation IA', category: 'Conformité', verified: false },
  ],
};

export const DEMO_PROFESSIONAL_PROFILE: ProfessionalProfile = {
  ...DEMO_PROFILE_WITHOUT_SCORE,
  completenessScore: computeCompletenessScore({ ...DEMO_PROFILE_WITHOUT_SCORE, completenessScore: 0 }),
};

@Service()
export class ProfessionalProfileMockAdapter implements ProfessionalProfilePort {
  getProfile(): Observable<ProfessionalProfile> {
    return of(DEMO_PROFESSIONAL_PROFILE);
  }

  updateProfile(profile: ProfessionalProfile): Observable<ProfessionalProfile> {
    return of(profile);
  }
}
