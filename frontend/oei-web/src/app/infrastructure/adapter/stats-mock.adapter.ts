import { Service } from '@angular/core';
import { StatsPort } from '../../domain/port/stats.port';
import { createStat, Stat } from '../../domain/model/stat';

// Note: toutes les valeurs sont à 0 car l'association n'a pas encore de membres fondateurs,
// partenaires académiques, pays concernés ni certifications réels à afficher. Afficher 0
// plutôt qu'inventer des chiffres respecte la règle d'honnêteté déjà appliquée sur la page
// « Membres fondateurs ».
const FIXTURES: Stat[] = [
  createStat({ label: 'Membres fondateurs', value: 0 }),
  createStat({ label: 'Partenaires académiques', value: 0 }),
  createStat({ label: 'Pays concernés', value: 0 }),
  createStat({ label: 'Certifications en développement', value: 0 }),
];

@Service()
export class StatsMockAdapter implements StatsPort {
  async getHomeStats(): Promise<Stat[]> {
    return FIXTURES;
  }
}
