import { Service } from '@angular/core';
import { DomainsPort } from '../../domain/port/domains.port';
import { createDomainArea, DomainArea } from '../../domain/model/domain-area';
import { SupportedLanguage } from '../../domain/model/document';

// Note: ces 8 domaines sont les catégories d'action déjà arrêtées dans les documents de vision
// du projet (plan directeur, statuts). Ce ne sont pas des données inventées, mais ils restent
// servis par un adaptateur mock tant qu'un backend de contenu réel n'existe pas.
//
// Localized per language (same pattern as `ContentMockAdapter`/`StatsMockAdapter`): each entry
// below is a full translation of the same eight domains, not a French copy duplicated per key.
const FIXTURES: Record<SupportedLanguage, DomainArea[]> = {
  fr: [
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
      description: "Promouvoir des pratiques d'architecture logicielle rigoureuses.",
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
  ],
  en: [
    createDomainArea({
      icon: 'shield-lock',
      title: 'Cybersecurity',
      description: "Strengthen systems' resilience against digital threats.",
    }),
    createDomainArea({
      icon: 'cpu',
      title: 'Artificial Intelligence',
      description: 'Frame the responsible development and use of AI.',
    }),
    createDomainArea({
      icon: 'leaf',
      title: 'Green IT',
      description: "Reduce technology's environmental footprint.",
    }),
    createDomainArea({
      icon: 'server',
      title: 'Critical Software',
      description: "Guarantee the reliability of society's essential software.",
    }),
    createDomainArea({
      icon: 'graduation-cap',
      title: 'Continuing Education',
      description: 'Support skills development throughout a career.',
    }),
    createDomainArea({
      icon: 'layers',
      title: 'Architecture & Quality',
      description: 'Promote rigorous software architecture practices.',
    }),
    createDomainArea({
      icon: 'lock',
      title: 'Data Protection',
      description: 'Defend privacy and personal data protection.',
    }),
    createDomainArea({
      icon: 'scale',
      title: 'Ethics & Society',
      description: "Question technology's impact on people and society.",
    }),
  ],
  de: [
    createDomainArea({
      icon: 'shield-lock',
      title: 'Cybersicherheit',
      description: 'Die Widerstandsfähigkeit von Systemen gegen digitale Bedrohungen stärken.',
    }),
    createDomainArea({
      icon: 'cpu',
      title: 'Künstliche Intelligenz',
      description: 'Die verantwortungsvolle Entwicklung und Nutzung von KI gestalten.',
    }),
    createDomainArea({
      icon: 'leaf',
      title: 'Grüne IT',
      description: 'Den ökologischen Fußabdruck der digitalen Technik verringern.',
    }),
    createDomainArea({
      icon: 'server',
      title: 'Kritische Software',
      description: 'Die Zuverlässigkeit gesellschaftlich wesentlicher Software gewährleisten.',
    }),
    createDomainArea({
      icon: 'graduation-cap',
      title: 'Kontinuierliche Weiterbildung',
      description: 'Die Kompetenzentwicklung während der gesamten Laufbahn begleiten.',
    }),
    createDomainArea({
      icon: 'layers',
      title: 'Architektur & Qualität',
      description: 'Rigorose Praktiken der Softwarearchitektur fördern.',
    }),
    createDomainArea({
      icon: 'lock',
      title: 'Datenschutz',
      description: 'Die Privatsphäre und den Schutz personenbezogener Daten verteidigen.',
    }),
    createDomainArea({
      icon: 'scale',
      title: 'Ethik & Gesellschaft',
      description: 'Die Auswirkungen der digitalen Technik auf Mensch und Gesellschaft hinterfragen.',
    }),
  ],
  es: [
    createDomainArea({
      icon: 'shield-lock',
      title: 'Ciberseguridad',
      description: 'Reforzar la resiliencia de los sistemas frente a las amenazas digitales.',
    }),
    createDomainArea({
      icon: 'cpu',
      title: 'Inteligencia Artificial',
      description: 'Enmarcar el desarrollo y el uso responsable de la IA.',
    }),
    createDomainArea({
      icon: 'leaf',
      title: 'Informática Verde',
      description: 'Reducir la huella medioambiental de la tecnología digital.',
    }),
    createDomainArea({
      icon: 'server',
      title: 'Software Crítico',
      description: 'Garantizar la fiabilidad del software esencial para la sociedad.',
    }),
    createDomainArea({
      icon: 'graduation-cap',
      title: 'Formación Continua',
      description: 'Acompañar el desarrollo de competencias a lo largo de la carrera.',
    }),
    createDomainArea({
      icon: 'layers',
      title: 'Arquitectura y Calidad',
      description: 'Promover prácticas rigurosas de arquitectura de software.',
    }),
    createDomainArea({
      icon: 'lock',
      title: 'Protección de Datos',
      description: 'Defender la privacidad y la protección de los datos personales.',
    }),
    createDomainArea({
      icon: 'scale',
      title: 'Ética y Sociedad',
      description: 'Cuestionar el impacto de la tecnología digital en las personas y la sociedad.',
    }),
  ],
  it: [
    createDomainArea({
      icon: 'shield-lock',
      title: 'Cybersicurezza',
      description: 'Rafforzare la resilienza dei sistemi di fronte alle minacce digitali.',
    }),
    createDomainArea({
      icon: 'cpu',
      title: 'Intelligenza Artificiale',
      description: "Inquadrare lo sviluppo e l'uso responsabile dell'IA.",
    }),
    createDomainArea({
      icon: 'leaf',
      title: 'Informatica Verde',
      description: "Ridurre l'impronta ambientale del digitale.",
    }),
    createDomainArea({
      icon: 'server',
      title: 'Software Critico',
      description: 'Garantire l\'affidabilità dei software essenziali per la società.',
    }),
    createDomainArea({
      icon: 'graduation-cap',
      title: 'Formazione Continua',
      description: "Accompagnare la crescita delle competenze lungo tutta la carriera.",
    }),
    createDomainArea({
      icon: 'layers',
      title: 'Architettura e Qualità',
      description: 'Promuovere pratiche rigorose di architettura software.',
    }),
    createDomainArea({
      icon: 'lock',
      title: 'Protezione dei Dati',
      description: 'Difendere la privacy e la protezione dei dati personali.',
    }),
    createDomainArea({
      icon: 'scale',
      title: 'Etica e Società',
      description: "Interrogarsi sull'impatto del digitale sull'essere umano e sulla società.",
    }),
  ],
  pt: [
    createDomainArea({
      icon: 'shield-lock',
      title: 'Cibersegurança',
      description: 'Reforçar a resiliência dos sistemas face às ameaças digitais.',
    }),
    createDomainArea({
      icon: 'cpu',
      title: 'Inteligência Artificial',
      description: 'Enquadrar o desenvolvimento e o uso responsável da IA.',
    }),
    createDomainArea({
      icon: 'leaf',
      title: 'Informática Verde',
      description: 'Reduzir a pegada ambiental do digital.',
    }),
    createDomainArea({
      icon: 'server',
      title: 'Software Crítico',
      description: 'Garantir a fiabilidade dos softwares essenciais para a sociedade.',
    }),
    createDomainArea({
      icon: 'graduation-cap',
      title: 'Formação Contínua',
      description: 'Acompanhar o desenvolvimento de competências ao longo da carreira.',
    }),
    createDomainArea({
      icon: 'layers',
      title: 'Arquitetura e Qualidade',
      description: 'Promover práticas rigorosas de arquitetura de software.',
    }),
    createDomainArea({
      icon: 'lock',
      title: 'Proteção de Dados',
      description: 'Defender a privacidade e a proteção dos dados pessoais.',
    }),
    createDomainArea({
      icon: 'scale',
      title: 'Ética e Sociedade',
      description: 'Questionar o impacto do digital sobre o ser humano e a sociedade.',
    }),
  ],
};

@Service()
export class DomainsMockAdapter implements DomainsPort {
  async getDomainAreas(lang: string): Promise<DomainArea[]> {
    return FIXTURES[lang as SupportedLanguage] ?? FIXTURES['en'];
  }
}
