import { Service } from '@angular/core';
import { StatsPort } from '../../domain/port/stats.port';
import { createStat, Stat } from '../../domain/model/stat';
import { SupportedLanguage } from '../../domain/model/document';

// Note: toutes les valeurs sont à 0 car l'association n'a pas encore de membres fondateurs,
// partenaires académiques, pays concernés ni certifications réels à afficher. Afficher 0
// plutôt qu'inventer des chiffres respecte la règle d'honnêteté déjà appliquée sur la page
// « Membres fondateurs ».
//
// Labels are localized per language (same pattern as `ContentMockAdapter`): each entry below
// is a full translation of the same four stats, not just the French copy duplicated across keys.
const FIXTURES: Record<SupportedLanguage, Stat[]> = {
  fr: [
    createStat({ label: 'Membres fondateurs', value: 0 }),
    createStat({ label: 'Partenaires académiques', value: 0 }),
    createStat({ label: 'Pays concernés', value: 0 }),
    createStat({ label: 'Certifications en développement', value: 0 }),
  ],
  en: [
    createStat({ label: 'Founding members', value: 0 }),
    createStat({ label: 'Academic partners', value: 0 }),
    createStat({ label: 'Countries involved', value: 0 }),
    createStat({ label: 'Certifications in development', value: 0 }),
  ],
  de: [
    createStat({ label: 'Gründungsmitglieder', value: 0 }),
    createStat({ label: 'Akademische Partner', value: 0 }),
    createStat({ label: 'Beteiligte Länder', value: 0 }),
    createStat({ label: 'Zertifizierungen in Entwicklung', value: 0 }),
  ],
  es: [
    createStat({ label: 'Miembros fundadores', value: 0 }),
    createStat({ label: 'Socios académicos', value: 0 }),
    createStat({ label: 'Países implicados', value: 0 }),
    createStat({ label: 'Certificaciones en desarrollo', value: 0 }),
  ],
  it: [
    createStat({ label: 'Membri fondatori', value: 0 }),
    createStat({ label: 'Partner accademici', value: 0 }),
    createStat({ label: 'Paesi coinvolti', value: 0 }),
    createStat({ label: 'Certificazioni in sviluppo', value: 0 }),
  ],
  pt: [
    createStat({ label: 'Membros fundadores', value: 0 }),
    createStat({ label: 'Parceiros académicos', value: 0 }),
    createStat({ label: 'Países envolvidos', value: 0 }),
    createStat({ label: 'Certificações em desenvolvimento', value: 0 }),
  ],
};

@Service()
export class StatsMockAdapter implements StatsPort {
  async getHomeStats(lang: string): Promise<Stat[]> {
    return FIXTURES[lang as SupportedLanguage] ?? FIXTURES['en'];
  }
}
