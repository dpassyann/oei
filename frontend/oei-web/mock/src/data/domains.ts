/**
 * Fixture data for the `/api/v1/domains/:lang` mock route.
 *
 * Kept in sync with `src/app/infrastructure/adapter/domains-mock.adapter.ts`. These 8 domains
 * are the action categories already settled in the project's vision documents — not invented
 * data, just served by a mock until real content management exists.
 */
export interface DomainAreaFixture {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

/** lang -> list of domain areas, in the canonical order. */
export const DOMAINS_FIXTURES: Record<string, DomainAreaFixture[]> = {
  fr: [
    {
      icon: 'shield-lock',
      title: 'Cybersécurité',
      description: 'Renforcer la résilience des systèmes face aux menaces numériques.',
    },
    {
      icon: 'cpu',
      title: 'Intelligence Artificielle',
      description: "Encadrer le développement et l'usage responsable de l'IA.",
    },
    {
      icon: 'leaf',
      title: 'Informatique Verte',
      description: "Réduire l'empreinte environnementale du numérique.",
    },
    {
      icon: 'server',
      title: 'Logiciels Critiques',
      description: 'Garantir la fiabilité des logiciels essentiels à la société.',
    },
    {
      icon: 'graduation-cap',
      title: 'Formation Continue',
      description: 'Accompagner la montée en compétence tout au long de la carrière.',
    },
    {
      icon: 'layers',
      title: 'Architecture & Qualité',
      description: "Promouvoir des pratiques d'architecture logicielle rigoureuses.",
    },
    {
      icon: 'lock',
      title: 'Protection des Données',
      description: 'Défendre le respect de la vie privée et des données personnelles.',
    },
    {
      icon: 'scale',
      title: 'Éthique & Société',
      description: "Interroger l'impact du numérique sur l'humain et la société.",
    },
  ],
  en: [
    {
      icon: 'shield-lock',
      title: 'Cybersecurity',
      description: "Strengthen systems' resilience against digital threats.",
    },
    {
      icon: 'cpu',
      title: 'Artificial Intelligence',
      description: 'Frame the responsible development and use of AI.',
    },
    {
      icon: 'leaf',
      title: 'Green IT',
      description: "Reduce technology's environmental footprint.",
    },
    {
      icon: 'server',
      title: 'Critical Software',
      description: "Guarantee the reliability of society's essential software.",
    },
    {
      icon: 'graduation-cap',
      title: 'Continuing Education',
      description: 'Support skills development throughout a career.',
    },
    {
      icon: 'layers',
      title: 'Architecture & Quality',
      description: 'Promote rigorous software architecture practices.',
    },
    {
      icon: 'lock',
      title: 'Data Protection',
      description: 'Defend privacy and personal data protection.',
    },
    {
      icon: 'scale',
      title: 'Ethics & Society',
      description: "Question technology's impact on people and society.",
    },
  ],
  de: [
    {
      icon: 'shield-lock',
      title: 'Cybersicherheit',
      description: 'Die Widerstandsfähigkeit von Systemen gegen digitale Bedrohungen stärken.',
    },
    {
      icon: 'cpu',
      title: 'Künstliche Intelligenz',
      description: 'Die verantwortungsvolle Entwicklung und Nutzung von KI gestalten.',
    },
    {
      icon: 'leaf',
      title: 'Grüne IT',
      description: 'Den ökologischen Fußabdruck der digitalen Technik verringern.',
    },
    {
      icon: 'server',
      title: 'Kritische Software',
      description: 'Die Zuverlässigkeit gesellschaftlich wesentlicher Software gewährleisten.',
    },
    {
      icon: 'graduation-cap',
      title: 'Kontinuierliche Weiterbildung',
      description: 'Die Kompetenzentwicklung während der gesamten Laufbahn begleiten.',
    },
    {
      icon: 'layers',
      title: 'Architektur & Qualität',
      description: 'Rigorose Praktiken der Softwarearchitektur fördern.',
    },
    {
      icon: 'lock',
      title: 'Datenschutz',
      description: 'Die Privatsphäre und den Schutz personenbezogener Daten verteidigen.',
    },
    {
      icon: 'scale',
      title: 'Ethik & Gesellschaft',
      description: 'Die Auswirkungen der digitalen Technik auf Mensch und Gesellschaft hinterfragen.',
    },
  ],
  es: [
    {
      icon: 'shield-lock',
      title: 'Ciberseguridad',
      description: 'Reforzar la resiliencia de los sistemas frente a las amenazas digitales.',
    },
    {
      icon: 'cpu',
      title: 'Inteligencia Artificial',
      description: 'Enmarcar el desarrollo y el uso responsable de la IA.',
    },
    {
      icon: 'leaf',
      title: 'Informática Verde',
      description: 'Reducir la huella medioambiental de la tecnología digital.',
    },
    {
      icon: 'server',
      title: 'Software Crítico',
      description: 'Garantizar la fiabilidad del software esencial para la sociedad.',
    },
    {
      icon: 'graduation-cap',
      title: 'Formación Continua',
      description: 'Acompañar el desarrollo de competencias a lo largo de la carrera.',
    },
    {
      icon: 'layers',
      title: 'Arquitectura y Calidad',
      description: 'Promover prácticas rigurosas de arquitectura de software.',
    },
    {
      icon: 'lock',
      title: 'Protección de Datos',
      description: 'Defender la privacidad y la protección de los datos personales.',
    },
    {
      icon: 'scale',
      title: 'Ética y Sociedad',
      description: 'Cuestionar el impacto de la tecnología digital en las personas y la sociedad.',
    },
  ],
  it: [
    {
      icon: 'shield-lock',
      title: 'Cybersicurezza',
      description: 'Rafforzare la resilienza dei sistemi di fronte alle minacce digitali.',
    },
    {
      icon: 'cpu',
      title: 'Intelligenza Artificiale',
      description: "Inquadrare lo sviluppo e l'uso responsabile dell'IA.",
    },
    {
      icon: 'leaf',
      title: 'Informatica Verde',
      description: "Ridurre l'impronta ambientale del digitale.",
    },
    {
      icon: 'server',
      title: 'Software Critico',
      description: "Garantire l'affidabilità dei software essenziali per la società.",
    },
    {
      icon: 'graduation-cap',
      title: 'Formazione Continua',
      description: 'Accompagnare la crescita delle competenze lungo tutta la carriera.',
    },
    {
      icon: 'layers',
      title: 'Architettura e Qualità',
      description: 'Promuovere pratiche rigorose di architettura software.',
    },
    {
      icon: 'lock',
      title: 'Protezione dei Dati',
      description: 'Difendere la privacy e la protezione dei dati personali.',
    },
    {
      icon: 'scale',
      title: 'Etica e Società',
      description: "Interrogarsi sull'impatto del digitale sull'essere umano e sulla società.",
    },
  ],
  pt: [
    {
      icon: 'shield-lock',
      title: 'Cibersegurança',
      description: 'Reforçar a resiliência dos sistemas face às ameaças digitais.',
    },
    {
      icon: 'cpu',
      title: 'Inteligência Artificial',
      description: 'Enquadrar o desenvolvimento e o uso responsável da IA.',
    },
    {
      icon: 'leaf',
      title: 'Informática Verde',
      description: 'Reduzir a pegada ambiental do digital.',
    },
    {
      icon: 'server',
      title: 'Software Crítico',
      description: 'Garantir a fiabilidade dos softwares essenciais para a sociedade.',
    },
    {
      icon: 'graduation-cap',
      title: 'Formação Contínua',
      description: 'Acompanhar o desenvolvimento de competências ao longo da carreira.',
    },
    {
      icon: 'layers',
      title: 'Arquitetura e Qualidade',
      description: 'Promover práticas rigorosas de arquitetura de software.',
    },
    {
      icon: 'lock',
      title: 'Proteção de Dados',
      description: 'Defender a privacidade e a proteção dos dados pessoais.',
    },
    {
      icon: 'scale',
      title: 'Ética e Sociedade',
      description: 'Questionar o impacto do digital sobre o ser humano e a sociedade.',
    },
  ],
};
