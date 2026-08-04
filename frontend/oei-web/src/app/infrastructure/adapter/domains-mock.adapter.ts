import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { DomainsPort } from '../../domain/port/domains.port';
import { createDomainArea, DomainArea } from '../../domain/model/domain-area';
import { SupportedLanguage } from '../../domain/model/document';

// Note: ces 8 domaines sont les catégories d'action déjà arrêtées dans les documents de vision
// du projet (plan directeur, statuts). Ce ne sont pas des données inventées, mais ils restent
// servis par un adaptateur mock tant qu'un backend de contenu réel n'existe pas.
//
// `slug` et `lastModified` sont des données structurelles indépendantes de la langue (mêmes
// valeurs dans les 6 tableaux ci-dessous) : le slug sert de clé de routage stable vers la page
// de détail `/domaines/:slug`, `lastModified` alimente l'affichage "Dernière mise à jour".
//
// Localized per language (same pattern as `ContentMockAdapter`/`StatsMockAdapter`): each entry
// below is a full translation of the same eight domains, not a French copy duplicated per key.
const FIXTURES: Record<SupportedLanguage, DomainArea[]> = {
  fr: [
    createDomainArea({
      slug: 'cybersecurite',
      icon: 'shield-lock',
      title: 'Cybersécurité',
      description: 'Renforcer la résilience des systèmes face aux menaces numériques.',
      lastModified: '2026-07-12',
    }),
    createDomainArea({
      slug: 'intelligence-artificielle',
      icon: 'brain',
      title: 'Intelligence Artificielle',
      description: "Encadrer le développement et l'usage responsable de l'IA.",
      lastModified: '2026-07-28',
    }),
    createDomainArea({
      slug: 'informatique-verte',
      icon: 'leaf',
      title: 'Informatique Verte',
      description: "Réduire l'empreinte environnementale du numérique.",
      lastModified: '2026-06-30',
    }),
    createDomainArea({
      slug: 'logiciels-critiques',
      icon: 'lock',
      title: 'Logiciels Critiques',
      description: 'Garantir la fiabilité des logiciels essentiels à la société.',
      lastModified: '2026-05-18',
    }),
    createDomainArea({
      slug: 'formation-continue',
      icon: 'graduation-cap',
      title: 'Formation Continue',
      description: 'Accompagner la montée en compétence tout au long de la carrière.',
      lastModified: '2026-07-02',
    }),
    createDomainArea({
      slug: 'architecture-qualite',
      icon: 'code',
      title: 'Architecture & Qualité',
      description: "Promouvoir des pratiques d'architecture logicielle rigoureuses.",
      lastModified: '2026-04-21',
    }),
    createDomainArea({
      slug: 'protection-donnees',
      icon: 'database',
      title: 'Protection des Données',
      description: 'Défendre le respect de la vie privée et des données personnelles.',
      lastModified: '2026-06-09',
    }),
    createDomainArea({
      slug: 'ethique-societe',
      icon: 'users',
      title: 'Éthique & Société',
      description: "Interroger l'impact du numérique sur l'humain et la société.",
      lastModified: '2026-07-20',
    }),
  ],
  en: [
    createDomainArea({
      slug: 'cybersecurite',
      icon: 'shield-lock',
      title: 'Cybersecurity',
      description: "Strengthen systems' resilience against digital threats.",
      lastModified: '2026-07-12',
    }),
    createDomainArea({
      slug: 'intelligence-artificielle',
      icon: 'brain',
      title: 'Artificial Intelligence',
      description: 'Frame the responsible development and use of AI.',
      lastModified: '2026-07-28',
    }),
    createDomainArea({
      slug: 'informatique-verte',
      icon: 'leaf',
      title: 'Green IT',
      description: "Reduce technology's environmental footprint.",
      lastModified: '2026-06-30',
    }),
    createDomainArea({
      slug: 'logiciels-critiques',
      icon: 'lock',
      title: 'Critical Software',
      description: "Guarantee the reliability of society's essential software.",
      lastModified: '2026-05-18',
    }),
    createDomainArea({
      slug: 'formation-continue',
      icon: 'graduation-cap',
      title: 'Continuing Education',
      description: 'Support skills development throughout a career.',
      lastModified: '2026-07-02',
    }),
    createDomainArea({
      slug: 'architecture-qualite',
      icon: 'code',
      title: 'Architecture & Quality',
      description: 'Promote rigorous software architecture practices.',
      lastModified: '2026-04-21',
    }),
    createDomainArea({
      slug: 'protection-donnees',
      icon: 'database',
      title: 'Data Protection',
      description: 'Defend privacy and personal data protection.',
      lastModified: '2026-06-09',
    }),
    createDomainArea({
      slug: 'ethique-societe',
      icon: 'users',
      title: 'Ethics & Society',
      description: "Question technology's impact on people and society.",
      lastModified: '2026-07-20',
    }),
  ],
  de: [
    createDomainArea({
      slug: 'cybersecurite',
      icon: 'shield-lock',
      title: 'Cybersicherheit',
      description: 'Die Widerstandsfähigkeit von Systemen gegen digitale Bedrohungen stärken.',
      lastModified: '2026-07-12',
    }),
    createDomainArea({
      slug: 'intelligence-artificielle',
      icon: 'brain',
      title: 'Künstliche Intelligenz',
      description: 'Die verantwortungsvolle Entwicklung und Nutzung von KI gestalten.',
      lastModified: '2026-07-28',
    }),
    createDomainArea({
      slug: 'informatique-verte',
      icon: 'leaf',
      title: 'Grüne IT',
      description: 'Den ökologischen Fußabdruck der digitalen Technik verringern.',
      lastModified: '2026-06-30',
    }),
    createDomainArea({
      slug: 'logiciels-critiques',
      icon: 'lock',
      title: 'Kritische Software',
      description: 'Die Zuverlässigkeit gesellschaftlich wesentlicher Software gewährleisten.',
      lastModified: '2026-05-18',
    }),
    createDomainArea({
      slug: 'formation-continue',
      icon: 'graduation-cap',
      title: 'Kontinuierliche Weiterbildung',
      description: 'Die Kompetenzentwicklung während der gesamten Laufbahn begleiten.',
      lastModified: '2026-07-02',
    }),
    createDomainArea({
      slug: 'architecture-qualite',
      icon: 'code',
      title: 'Architektur & Qualität',
      description: 'Rigorose Praktiken der Softwarearchitektur fördern.',
      lastModified: '2026-04-21',
    }),
    createDomainArea({
      slug: 'protection-donnees',
      icon: 'database',
      title: 'Datenschutz',
      description: 'Die Privatsphäre und den Schutz personenbezogener Daten verteidigen.',
      lastModified: '2026-06-09',
    }),
    createDomainArea({
      slug: 'ethique-societe',
      icon: 'users',
      title: 'Ethik & Gesellschaft',
      description: 'Die Auswirkungen der digitalen Technik auf Mensch und Gesellschaft hinterfragen.',
      lastModified: '2026-07-20',
    }),
  ],
  es: [
    createDomainArea({
      slug: 'cybersecurite',
      icon: 'shield-lock',
      title: 'Ciberseguridad',
      description: 'Reforzar la resiliencia de los sistemas frente a las amenazas digitales.',
      lastModified: '2026-07-12',
    }),
    createDomainArea({
      slug: 'intelligence-artificielle',
      icon: 'brain',
      title: 'Inteligencia Artificial',
      description: 'Enmarcar el desarrollo y el uso responsable de la IA.',
      lastModified: '2026-07-28',
    }),
    createDomainArea({
      slug: 'informatique-verte',
      icon: 'leaf',
      title: 'Informática Verde',
      description: 'Reducir la huella medioambiental de la tecnología digital.',
      lastModified: '2026-06-30',
    }),
    createDomainArea({
      slug: 'logiciels-critiques',
      icon: 'lock',
      title: 'Software Crítico',
      description: 'Garantizar la fiabilidad del software esencial para la sociedad.',
      lastModified: '2026-05-18',
    }),
    createDomainArea({
      slug: 'formation-continue',
      icon: 'graduation-cap',
      title: 'Formación Continua',
      description: 'Acompañar el desarrollo de competencias a lo largo de la carrera.',
      lastModified: '2026-07-02',
    }),
    createDomainArea({
      slug: 'architecture-qualite',
      icon: 'code',
      title: 'Arquitectura y Calidad',
      description: 'Promover prácticas rigurosas de arquitectura de software.',
      lastModified: '2026-04-21',
    }),
    createDomainArea({
      slug: 'protection-donnees',
      icon: 'database',
      title: 'Protección de Datos',
      description: 'Defender la privacidad y la protección de los datos personales.',
      lastModified: '2026-06-09',
    }),
    createDomainArea({
      slug: 'ethique-societe',
      icon: 'users',
      title: 'Ética y Sociedad',
      description: 'Cuestionar el impacto de la tecnología digital en las personas y la sociedad.',
      lastModified: '2026-07-20',
    }),
  ],
  it: [
    createDomainArea({
      slug: 'cybersecurite',
      icon: 'shield-lock',
      title: 'Cybersicurezza',
      description: 'Rafforzare la resilienza dei sistemi di fronte alle minacce digitali.',
      lastModified: '2026-07-12',
    }),
    createDomainArea({
      slug: 'intelligence-artificielle',
      icon: 'brain',
      title: 'Intelligenza Artificiale',
      description: "Inquadrare lo sviluppo e l'uso responsabile dell'IA.",
      lastModified: '2026-07-28',
    }),
    createDomainArea({
      slug: 'informatique-verte',
      icon: 'leaf',
      title: 'Informatica Verde',
      description: "Ridurre l'impronta ambientale del digitale.",
      lastModified: '2026-06-30',
    }),
    createDomainArea({
      slug: 'logiciels-critiques',
      icon: 'lock',
      title: 'Software Critico',
      description: "Garantire l'affidabilità dei software essenziali per la società.",
      lastModified: '2026-05-18',
    }),
    createDomainArea({
      slug: 'formation-continue',
      icon: 'graduation-cap',
      title: 'Formazione Continua',
      description: 'Accompagnare la crescita delle competenze lungo tutta la carriera.',
      lastModified: '2026-07-02',
    }),
    createDomainArea({
      slug: 'architecture-qualite',
      icon: 'code',
      title: 'Architettura e Qualità',
      description: 'Promuovere pratiche rigorose di architettura software.',
      lastModified: '2026-04-21',
    }),
    createDomainArea({
      slug: 'protection-donnees',
      icon: 'database',
      title: 'Protezione dei Dati',
      description: 'Difendere la privacy e la protezione dei dati personali.',
      lastModified: '2026-06-09',
    }),
    createDomainArea({
      slug: 'ethique-societe',
      icon: 'users',
      title: 'Etica e Società',
      description: "Interrogarsi sull'impatto del digitale sull'essere umano e sulla società.",
      lastModified: '2026-07-20',
    }),
  ],
  pt: [
    createDomainArea({
      slug: 'cybersecurite',
      icon: 'shield-lock',
      title: 'Cibersegurança',
      description: 'Reforçar a resiliência dos sistemas face às ameaças digitais.',
      lastModified: '2026-07-12',
    }),
    createDomainArea({
      slug: 'intelligence-artificielle',
      icon: 'brain',
      title: 'Inteligência Artificial',
      description: 'Enquadrar o desenvolvimento e o uso responsável da IA.',
      lastModified: '2026-07-28',
    }),
    createDomainArea({
      slug: 'informatique-verte',
      icon: 'leaf',
      title: 'Informática Verde',
      description: 'Reduzir a pegada ambiental do digital.',
      lastModified: '2026-06-30',
    }),
    createDomainArea({
      slug: 'logiciels-critiques',
      icon: 'lock',
      title: 'Software Crítico',
      description: 'Garantir a fiabilidade dos softwares essenciais para a sociedade.',
      lastModified: '2026-05-18',
    }),
    createDomainArea({
      slug: 'formation-continue',
      icon: 'graduation-cap',
      title: 'Formação Contínua',
      description: 'Acompanhar o desenvolvimento de competências ao longo da carreira.',
      lastModified: '2026-07-02',
    }),
    createDomainArea({
      slug: 'architecture-qualite',
      icon: 'code',
      title: 'Arquitetura e Qualidade',
      description: 'Promover práticas rigorosas de arquitetura de software.',
      lastModified: '2026-04-21',
    }),
    createDomainArea({
      slug: 'protection-donnees',
      icon: 'database',
      title: 'Proteção de Dados',
      description: 'Defender a privacidade e a proteção dos dados pessoais.',
      lastModified: '2026-06-09',
    }),
    createDomainArea({
      slug: 'ethique-societe',
      icon: 'users',
      title: 'Ética e Sociedade',
      description: 'Questionar o impacto do digital sobre o ser humano e a sociedade.',
      lastModified: '2026-07-20',
    }),
  ],
};

@Service()
export class DomainsMockAdapter implements DomainsPort {
  getDomainAreas(lang: string): Observable<DomainArea[]> {
    return of(FIXTURES[lang as SupportedLanguage] ?? FIXTURES['en']);
  }

  getDomainArea(slug: string, lang: string): Observable<DomainArea> {
    const domain = (FIXTURES[lang as SupportedLanguage] ?? FIXTURES['en']).find((area) => area.slug === slug);
    return domain ? of(domain) : throwError(() => new Error(`Unknown domain area slug: ${slug}`));
  }
}
