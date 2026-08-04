import { Institution } from './institution';
import { InstitutionOpportunity } from './institution-opportunity';
import { InstitutionPublication } from './institution-publication';
import { Partnership } from './partnership';

// Vue agrégée servie à `/institutions/{slug}` (doc 03 §"Page publique") — tout contenu est
// modéré : seules les publications au statut PUBLISHED et les opportunités PUBLISHED doivent
// apparaître ici (filtré côté adapter/backend, jamais côté template).
export interface InstitutionPublicPage {
  readonly institution: Institution;
  readonly partnership: Partnership | null;
  readonly publications: readonly InstitutionPublication[];
  readonly opportunities: readonly InstitutionOpportunity[];
}

export function createInstitutionPublicPage(fields: InstitutionPublicPage): InstitutionPublicPage {
  return Object.freeze({
    ...fields,
    publications: Object.freeze([...fields.publications]),
    opportunities: Object.freeze([...fields.opportunities]),
  });
}
