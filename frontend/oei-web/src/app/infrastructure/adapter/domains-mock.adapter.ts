import { Service } from '@angular/core';
import { DomainsPort } from '../../domain/port/domains.port';
import { createDomainArea, DomainArea } from '../../domain/model/domain-area';

// Note: ces 8 domaines sont les catégories d'action déjà arrêtées dans les documents de vision
// du projet (plan directeur, statuts). Ce ne sont pas des données inventées, mais ils restent
// servis par un adaptateur mock tant qu'un backend de contenu réel n'existe pas.
const FIXTURES: DomainArea[] = [
  createDomainArea({
    icon: 'shield-lock',
    title: 'Cybersécurité',
    description: 'Renforcer la résilience des systèmes face aux menaces numériques.',
  }),
  createDomainArea({
    icon: 'cpu',
    title: 'Intelligence Artificielle',
    description: "Encadrer le développement et l'usage responsable de l'IA.",
  }),
  createDomainArea({
    icon: 'leaf',
    title: 'Informatique Verte',
    description: "Réduire l'empreinte environnementale du numérique.",
  }),
  createDomainArea({
    icon: 'server',
    title: 'Logiciels Critiques',
    description: 'Garantir la fiabilité des logiciels essentiels à la société.',
  }),
  createDomainArea({
    icon: 'graduation-cap',
    title: 'Formation Continue',
    description: 'Accompagner la montée en compétence tout au long de la carrière.',
  }),
  createDomainArea({
    icon: 'layers',
    title: 'Architecture & Qualité',
    description: 'Promouvoir des pratiques d\'architecture logicielle rigoureuses.',
  }),
  createDomainArea({
    icon: 'lock',
    title: 'Protection des Données',
    description: 'Défendre le respect de la vie privée et des données personnelles.',
  }),
  createDomainArea({
    icon: 'scale',
    title: 'Éthique & Société',
    description: "Interroger l'impact du numérique sur l'humain et la société.",
  }),
];

@Service()
export class DomainsMockAdapter implements DomainsPort {
  async getDomainAreas(): Promise<DomainArea[]> {
    return FIXTURES;
  }
}
