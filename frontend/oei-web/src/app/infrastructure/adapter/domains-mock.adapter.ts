import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { DomainsPort } from '../../domain/port/domains.port';
import {
  createDomainArea,
  DomainArea,
  DomainSection,
  RelatedResource,
} from '../../domain/model/domain-area';
import { createNewsItem, NewsItem } from '../../domain/model/news-item';
import { SupportedLanguage } from '../../domain/model/document';

// Note: ces 9 domaines sont les catégories d'action déjà arrêtées dans les documents de vision
// du projet (plan directeur, statuts), auxquelles s'ajoute "Normes & Pratiques Professionnelles"
// (normes-pratiques) — le pont explicite entre le Livre Blanc et l'idée centrale de l'OEI de
// promouvoir des standards professionnels communs plutôt que de réglementer la technologie. Ce
// ne sont pas des données inventées, mais elles restent servies par un adaptateur mock tant
// qu'un backend de contenu réel n'existe pas.
//
// `slug` et `lastModified` sont des données structurelles indépendantes de la langue (mêmes
// valeurs dans les 6 tableaux ci-dessous) : le slug sert de clé de routage stable vers la page
// de détail `/domaines/:slug`, `lastModified` alimente l'affichage "Dernière mise à jour".
//
// Localized per language (same pattern as `ContentMockAdapter`/`StatsMockAdapter`): each entry
// below is a full translation of the same nine domains, not a French copy duplicated per key.
//
// Rich detail-page content (`subtitle`/`sections`/`relatedResources`/`relatedNews`) is an
// explicit FR/EN-only scope decision — the other four languages keep only the fields the home
// page's domain grid needs (`title`/`description`/`icon`) and `DomainsMockAdapter.getDomainArea`
// below falls back to the English content for the detail page body in that case.

// --- Shared "Related Resources" — identical across all 9 domains: the White Paper and the
// Code of Ethics are genuinely cross-domain OEI resources (real pages, not placeholders), plus
// two generic resource types (guide/study) the brief explicitly allows as mock data pending a
// real content backend.
const RELATED_RESOURCES_FR: readonly RelatedResource[] = [
  {
    title: 'Livre Blanc de l’OEI',
    description:
      "La synthèse complète de la vision de l'OEI sur la reconnaissance progressive de la profession informatique.",
    path: '/livre-blanc',
  },
  {
    title: 'Code de déontologie',
    description:
      "Les principes professionnels et éthiques que l'OEI promeut auprès de la communauté informatique.",
    path: '/deontologie',
  },
  {
    title: 'Guides pratiques',
    description:
      'Des guides opérationnels destinés aux professionnels souhaitant approfondir ce domaine.',
    path: '/ressources',
  },
  {
    title: 'Études et rapports',
    description:
      "Des études et rapports de référence, sélectionnés ou produits par l'OEI et ses contributeurs.",
    path: '/ressources',
  },
];
const RELATED_RESOURCES_EN: readonly RelatedResource[] = [
  {
    title: 'OEI White Paper',
    description:
      "The full account of the OEI's vision for the progressive recognition of the IT profession.",
    path: '/livre-blanc',
  },
  {
    title: 'Code of Ethics',
    description:
      'The professional and ethical principles the OEI promotes across the IT community.',
    path: '/deontologie',
  },
  {
    title: 'Practical Guides',
    description: 'Operational guides for professionals who want to go further in this domain.',
    path: '/ressources',
  },
  {
    title: 'Studies & Reports',
    description:
      'Reference studies and reports, curated or produced by the OEI and its contributors.',
    path: '/ressources',
  },
];

// --- "Related News" — filtered by topic per the brief ("Cybersecurity News", "AI News"…).
// Reuses the existing `NewsItem` model (see `domain/model/news-item.ts`) rather than the
// `NewsPort`/`NewsMockAdapter` (whose 3 fixtures are site-wide milestones, not per-domain), and
// stays mock data pointing at real, existing pages (`/nos-missions`, `/actualites`) — exactly
// the "mock data, backend later" scope the brief calls for.
function relatedNewsFr(domainTitle: string): readonly NewsItem[] {
  return [
    createNewsItem({
      title: `${domainTitle} : rejoignez le groupe de travail thématique`,
      excerpt: `L'OEI invite les professionnels du numérique concernés par ${domainTitle.toLowerCase()} à contribuer aux travaux du groupe de travail dédié.`,
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
    }),
    createNewsItem({
      title: `${domainTitle} : les prochaines pistes de travail de l'OEI`,
      excerpt: `Un aperçu des prochains chantiers explorés par l'OEI dans le domaine de ${domainTitle.toLowerCase()}.`,
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/actualites',
    }),
  ];
}
function relatedNewsEn(domainTitle: string): readonly NewsItem[] {
  return [
    createNewsItem({
      title: `${domainTitle}: join the thematic working group`,
      excerpt: `The OEI invites IT professionals working on ${domainTitle.toLowerCase()} to contribute to the dedicated working group.`,
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
    }),
    createNewsItem({
      title: `${domainTitle}: the OEI's upcoming workstreams`,
      excerpt: `An overview of the OEI's upcoming workstreams in the field of ${domainTitle.toLowerCase()}.`,
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/actualites',
    }),
  ];
}

// ============================================================================================
// Cybersecurity / Cybersécurité
// ============================================================================================
const CYBERSECURITE_SECTIONS_FR: readonly DomainSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    paragraphs: [
      "La cybersécurité n'est plus un sujet technique périphérique : elle conditionne la continuité des hôpitaux, des réseaux électriques, des systèmes financiers et des administrations publiques. Chaque incident majeur rappelle qu'une infrastructure numérique compromise peut avoir des conséquences directes sur la vie quotidienne de millions de personnes.",
      "Pour l'OEI, la cybersécurité est une responsabilité professionnelle avant d'être une contrainte réglementaire : elle engage la compétence de celles et ceux qui conçoivent, déploient et exploitent les systèmes numériques.",
    ],
  },
  {
    id: 'threat-landscape',
    title: 'Threat Landscape',
    paragraphs: [
      "Le paysage des menaces évolue plus rapidement que la plupart des organisations ne peuvent s'y adapter. Les attaquants — cybercriminels organisés, acteurs étatiques, groupes opportunistes — exploitent aussi bien des vulnérabilités techniques que des failles humaines.",
    ],
    bullets: [
      'Rançongiciels et extorsion de données',
      'Espionnage industriel et étatique',
      'Attaques soutenues par des États',
      "Compromission de la chaîne d'approvisionnement logicielle",
      'Menaces spécifiques au cloud',
      "Menaces émergentes liées à l'intelligence artificielle",
    ],
  },
  {
    id: 'security-by-design',
    title: 'Security by Design',
    paragraphs: [
      "La sécurité ne peut plus être ajoutée après coup : elle doit être intégrée dès la conception des systèmes. Cette exigence transforme les pratiques de développement, d'exploitation et de gestion des identités et des secrets.",
    ],
    bullets: [
      'Développement sécurisé (secure development lifecycle)',
      'DevSecOps et intégration continue de la sécurité',
      'Architecture Zero Trust',
      'Gestion des identités et des accès (IAM)',
      'Gestion des secrets et des clés cryptographiques',
    ],
  },
  {
    id: 'governance',
    title: 'Governance',
    paragraphs: [
      "La gouvernance de la cybersécurité s'appuie sur un ensemble croissant de cadres normatifs et réglementaires internationaux, qui structurent les obligations des organisations sans pour autant se substituer à la compétence individuelle des professionnels qui les mettent en œuvre.",
    ],
    bullets: [
      'ISO/IEC 27001 et la famille des normes de management de la sécurité',
      'Le cadre NIST Cybersecurity Framework',
      'Le règlement européen DORA pour le secteur financier',
      'La directive européenne NIS2',
      "Les réglementations sectorielles et nationales à l'échelle internationale",
    ],
  },
  {
    id: 'skills-careers',
    title: 'Skills & Careers',
    paragraphs: [
      "La diversité des métiers de la cybersécurité reflète la diversité des menaces qu'elle doit couvrir. L'OEI considère que la reconnaissance de ces métiers passe par une clarification progressive des compétences attendues à chaque niveau de responsabilité.",
    ],
    bullets: [
      'Analystes et opérateurs de centre opérationnel de sécurité (SOC)',
      "Testeurs d'intrusion (pentest)",
      'Architectes sécurité',
      'Fonctions de gouvernance, risque et conformité (GRC)',
      'Spécialistes de la sécurité du cloud',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "L'OEI défend l'idée que la cybersécurité est un champ de responsabilité professionnelle à part entière, et non une simple case de conformité à cocher. Elle appelle à une reconnaissance progressive des compétences des professionnels de la sécurité, fondée sur des référentiels communs plutôt que sur des titres auto-proclamés.",
      "Sans prétendre se substituer aux régulateurs ni revendiquer un statut d'ordre professionnel légal, l'OEI, en tant que mouvement fondateur, entend fédérer les praticiens de la cybersécurité autour d'exigences partagées de compétence, de formation continue et de déontologie.",
    ],
  },
];
const CYBERSECURITE_SECTIONS_EN: readonly DomainSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    paragraphs: [
      'Cybersecurity is no longer a peripheral technical topic: it underpins the continuity of hospitals, power grids, financial systems and public administrations. Every major incident is a reminder that a compromised digital infrastructure can directly affect the daily lives of millions of people.',
      'For the OEI, cybersecurity is a professional responsibility before it is a regulatory constraint: it engages the competence of those who design, deploy and operate digital systems.',
    ],
  },
  {
    id: 'threat-landscape',
    title: 'Threat Landscape',
    paragraphs: [
      'The threat landscape evolves faster than most organizations can adapt to. Attackers — organized cybercriminals, state actors, opportunistic groups — exploit both technical vulnerabilities and human weaknesses.',
    ],
    bullets: [
      'Ransomware and data extortion',
      'Industrial and state-sponsored espionage',
      'State-backed attacks',
      'Software supply chain compromise',
      'Cloud-specific threats',
      'Emerging threats linked to artificial intelligence',
    ],
  },
  {
    id: 'security-by-design',
    title: 'Security by Design',
    paragraphs: [
      'Security can no longer be bolted on after the fact: it must be built in from the very design of a system. This requirement reshapes development, operations, and identity and secrets management practices.',
    ],
    bullets: [
      'Secure development lifecycle',
      'DevSecOps and continuous security integration',
      'Zero Trust architecture',
      'Identity and access management (IAM)',
      'Secrets and cryptographic key management',
    ],
  },
  {
    id: 'governance',
    title: 'Governance',
    paragraphs: [
      "Cybersecurity governance rests on a growing body of international frameworks and regulations, which structure organizations' obligations without substituting for the individual competence of the professionals who implement them.",
    ],
    bullets: [
      'ISO/IEC 27001 and the information security management family of standards',
      'The NIST Cybersecurity Framework',
      "The EU's DORA regulation for the financial sector",
      'The EU NIS2 directive',
      'Sector-specific and national regulations worldwide',
    ],
  },
  {
    id: 'skills-careers',
    title: 'Skills & Careers',
    paragraphs: [
      'The diversity of cybersecurity roles mirrors the diversity of threats they must cover. The OEI believes recognizing these roles requires progressively clarifying the competencies expected at each level of responsibility.',
    ],
    bullets: [
      'Security Operations Center (SOC) analysts and operators',
      'Penetration testers',
      'Security architects',
      'Governance, risk and compliance (GRC) functions',
      'Cloud security specialists',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      'The OEI holds that cybersecurity is a professional responsibility in its own right, not a compliance checkbox. It calls for the progressive recognition of security professionals’ competencies, grounded in shared frameworks rather than self-proclaimed titles.',
      'Without claiming to replace regulators or a legal professional-order status, the OEI, as a founding movement, intends to bring cybersecurity practitioners together around shared requirements for competence, continuous learning and ethics.',
    ],
  },
];

// ============================================================================================
// Artificial Intelligence / Intelligence Artificielle
// ============================================================================================
const IA_SECTIONS_FR: readonly DomainSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    paragraphs: [
      "L'intelligence artificielle s'est imposée en quelques années comme une technologie structurante, capable d'assister, d'accélérer ou de remplacer des décisions humaines dans des domaines aussi variés que la santé, la finance, la justice ou l'administration publique.",
      "Cette rapidité d'adoption crée un décalage entre la puissance des systèmes déployés et la maturité des cadres de compétence, de gouvernance et de responsabilité qui devraient les accompagner.",
    ],
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    paragraphs: [
      "L'apprentissage automatique reste le socle technique de la plupart des systèmes d'IA actuels. Sa maîtrise exige une compréhension rigoureuse des données d'entraînement, des biais qu'elles peuvent véhiculer et des limites statistiques des modèles produits.",
    ],
  },
  {
    id: 'generative-ai',
    title: 'Generative AI',
    paragraphs: [
      "L'IA générative a profondément transformé la production de contenu, de code et de décision assistée. Elle pose des questions nouvelles de fiabilité, de traçabilité et de propriété intellectuelle que les professionnels du numérique doivent apprendre à maîtriser.",
    ],
  },
  {
    id: 'responsible-ai',
    title: 'Responsible AI',
    paragraphs: [
      "Une IA responsable suppose une vigilance constante sur les biais, la transparence des choix de conception et l'explicabilité des résultats produits.",
    ],
    bullets: [
      'Détection et correction des biais',
      'Transparence des modèles et des données',
      'Explicabilité des décisions automatisées',
      "Gouvernance des systèmes d'IA tout au long de leur cycle de vie",
    ],
  },
  {
    id: 'ai-safety',
    title: 'AI Safety',
    paragraphs: [
      "La sûreté de l'IA concerne autant les risques de mauvais usage que les défaillances techniques imprévues des systèmes les plus avancés. Elle appelle des pratiques d'évaluation, de test et de supervision humaine adaptées à la criticité des cas d'usage.",
    ],
  },
  {
    id: 'ai-and-society',
    title: 'AI and Society',
    paragraphs: [
      "L'intelligence artificielle transforme l'emploi, l'accès à l'information et les rapports de pouvoir entre organisations et individus. Ces transformations ne peuvent être laissées aux seuls choix techniques des équipes qui développent ces systèmes.",
    ],
  },
  {
    id: 'future-skills',
    title: 'Future Skills',
    paragraphs: [
      "Les compétences requises pour concevoir, déployer et superviser des systèmes d'IA évoluent rapidement. L'OEI considère que la formation continue des professionnels est une condition de la maîtrise collective de cette transformation.",
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "L'OEI ne prône pas un frein à l'innovation, mais une professionnalisation de ceux qui la portent : les personnes qui conçoivent des systèmes d'IA à fort impact doivent pouvoir démontrer une compétence réelle et respecter des principes déontologiques partagés.",
      "En tant que mouvement fondateur, l'OEI entend contribuer aux discussions internationales sur la gouvernance de l'IA en portant la voix des praticiens, aux côtés des régulateurs, des chercheurs et de la société civile — sans se substituer à aucun d'entre eux.",
    ],
  },
];
const IA_SECTIONS_EN: readonly DomainSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    paragraphs: [
      'In just a few years, artificial intelligence has become a foundational technology, able to assist, accelerate or replace human decisions across fields as varied as healthcare, finance, justice and public administration.',
      'This speed of adoption has created a gap between the power of the systems being deployed and the maturity of the competence, governance and accountability frameworks that should accompany them.',
    ],
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    paragraphs: [
      'Machine learning remains the technical foundation of most AI systems in use today. Mastering it requires a rigorous understanding of training data, the biases it may carry, and the statistical limits of the resulting models.',
    ],
  },
  {
    id: 'generative-ai',
    title: 'Generative AI',
    paragraphs: [
      'Generative AI has profoundly transformed the production of content, code and assisted decision-making. It raises new questions of reliability, traceability and intellectual property that digital professionals must learn to master.',
    ],
  },
  {
    id: 'responsible-ai',
    title: 'Responsible AI',
    paragraphs: [
      'Responsible AI requires constant vigilance over bias, transparency in design choices, and the explainability of the results produced.',
    ],
    bullets: [
      'Detecting and correcting bias',
      'Transparency of models and data',
      'Explainability of automated decisions',
      'Governance of AI systems throughout their lifecycle',
    ],
  },
  {
    id: 'ai-safety',
    title: 'AI Safety',
    paragraphs: [
      'AI safety is as much about the risk of misuse as it is about unforeseen technical failures in the most advanced systems. It calls for evaluation, testing and human oversight practices proportionate to the criticality of each use case.',
    ],
  },
  {
    id: 'ai-and-society',
    title: 'AI and Society',
    paragraphs: [
      'Artificial intelligence is reshaping employment, access to information, and the balance of power between organizations and individuals. These transformations cannot be left solely to the technical choices of the teams building these systems.',
    ],
  },
  {
    id: 'future-skills',
    title: 'Future Skills',
    paragraphs: [
      'The skills required to design, deploy and oversee AI systems are evolving rapidly. The OEI considers continuous learning by professionals to be a precondition for collectively mastering this transformation.',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      'The OEI does not advocate slowing innovation, but professionalizing those who drive it: people who design high-impact AI systems should be able to demonstrate genuine competence and abide by shared ethical principles.',
      'As a founding movement, the OEI intends to contribute to international discussions on AI governance by giving voice to practitioners, alongside regulators, researchers and civil society — without claiming to replace any of them.',
    ],
  },
];

// ============================================================================================
// Continuous Learning / Formation Continue
// ============================================================================================
const FORMATION_SECTIONS_FR: readonly DomainSection[] = [
  {
    id: 'why-lifelong-learning-matters',
    title: 'Why Lifelong Learning Matters',
    paragraphs: [
      "Les technologies de l'information évoluent à un rythme qui rend obsolète, en quelques années, une part significative des compétences acquises en formation initiale. Aucun diplôme, quelle que soit sa qualité, ne peut à lui seul garantir la compétence d'un professionnel tout au long de sa carrière.",
      "L'apprentissage continu n'est donc pas une option individuelle parmi d'autres : c'est une condition structurelle de la fiabilité de la profession informatique dans son ensemble.",
    ],
  },
  {
    id: 'certifications',
    title: 'Certifications',
    paragraphs: [
      "Les certifications professionnelles offrent des repères utiles, à condition d'être elles-mêmes rigoureuses, actualisées et reconnues au-delà d'un seul éditeur ou d'une seule organisation.",
    ],
  },
  {
    id: 'academic-education',
    title: 'Academic Education',
    paragraphs: [
      'La formation académique reste la porte d’entrée principale vers la profession. Elle gagnerait à intégrer plus systématiquement les dimensions éthiques, réglementaires et sociétales du métier, aux côtés des fondamentaux techniques.',
    ],
  },
  {
    id: 'professional-training',
    title: 'Professional Training',
    paragraphs: [
      "La formation professionnelle continue, organisée par les employeurs ou des organismes spécialisés, permet d'actualiser des compétences précises face à l'évolution rapide des outils, des menaces et des cadres réglementaires.",
    ],
  },
  {
    id: 'self-learning',
    title: 'Self Learning',
    paragraphs: [
      "L'auto-formation occupe une place particulière dans une discipline où une large part du savoir circule librement — documentation, communautés en ligne, projets open source. Cette richesse doit être reconnue, sans pour autant remplacer des parcours structurés de validation des compétences.",
    ],
  },
  {
    id: 'mentorship',
    title: 'Mentorship',
    paragraphs: [
      'Le mentorat et le compagnonnage restent parmi les moyens les plus efficaces de transmettre non seulement des compétences techniques, mais aussi une culture professionnelle faite de rigueur et de responsabilité.',
    ],
  },
  {
    id: 'knowledge-sharing',
    title: 'Knowledge Sharing',
    paragraphs: [
      "Le partage de connaissances — conférences, publications, contributions open source, retours d'expérience — est une pratique constitutive de la culture informatique. L'OEI entend l'encourager plutôt que la contraindre.",
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "L'OEI considère la formation continue comme un pilier de la responsabilité professionnelle, au même titre que la compétence initiale. Elle plaide pour une exigence explicite et documentée de mise à jour régulière des compétences, en particulier pour les professionnels intervenant sur des systèmes critiques.",
      'Cette exigence ne vise pas à exclure, mais à donner à chaque professionnel les moyens de faire reconnaître, tout au long de sa carrière, un niveau de compétence à jour et vérifiable.',
    ],
  },
];
const FORMATION_SECTIONS_EN: readonly DomainSection[] = [
  {
    id: 'why-lifelong-learning-matters',
    title: 'Why Lifelong Learning Matters',
    paragraphs: [
      'Information technology evolves at a pace that renders a significant share of the skills acquired in initial education obsolete within a few years. No degree, however good, can on its own guarantee a professional’s competence over an entire career.',
      'Lifelong learning is therefore not one individual option among others: it is a structural condition for the reliability of the IT profession as a whole.',
    ],
  },
  {
    id: 'certifications',
    title: 'Certifications',
    paragraphs: [
      'Professional certifications provide useful benchmarks, provided they are themselves rigorous, kept up to date, and recognized beyond a single vendor or organization.',
    ],
  },
  {
    id: 'academic-education',
    title: 'Academic Education',
    paragraphs: [
      'Academic education remains the main entry point into the profession. It would benefit from more systematically integrating the ethical, regulatory and societal dimensions of the job alongside technical fundamentals.',
    ],
  },
  {
    id: 'professional-training',
    title: 'Professional Training',
    paragraphs: [
      'Ongoing professional training, organized by employers or specialized bodies, keeps specific skills up to date in the face of rapidly changing tools, threats and regulatory frameworks.',
    ],
  },
  {
    id: 'self-learning',
    title: 'Self Learning',
    paragraphs: [
      'Self-directed learning holds a special place in a discipline where a large share of knowledge circulates freely — documentation, online communities, open source projects. This richness deserves recognition, without replacing structured pathways for validating competence.',
    ],
  },
  {
    id: 'mentorship',
    title: 'Mentorship',
    paragraphs: [
      'Mentorship and apprenticeship remain among the most effective ways to pass on not only technical skills, but also a professional culture built on rigor and accountability.',
    ],
  },
  {
    id: 'knowledge-sharing',
    title: 'Knowledge Sharing',
    paragraphs: [
      'Sharing knowledge — conferences, publications, open source contributions, lessons learned — is a defining practice of IT culture. The OEI intends to encourage it rather than constrain it.',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      'The OEI views continuous learning as a pillar of professional responsibility, on par with initial competence. It calls for an explicit, documented requirement to regularly update one’s skills, particularly for professionals working on critical systems.',
      'This requirement is not meant to exclude, but to give every professional the means to have an up-to-date, verifiable level of competence recognized throughout their career.',
    ],
  },
];

// ============================================================================================
// Architecture & Quality / Architecture & Qualité
// ============================================================================================
const ARCHITECTURE_SECTIONS_FR: readonly DomainSection[] = [
  {
    id: 'software-architecture',
    title: 'Software Architecture',
    paragraphs: [
      "L'architecture logicielle est la discipline qui détermine, souvent pour des années, la capacité d'un système à évoluer, à résister à la charge et à rester compréhensible par les équipes qui le maintiennent. Les décisions d'architecture engagent une responsabilité qui dépasse largement le code écrit à un instant donné.",
    ],
  },
  {
    id: 'enterprise-architecture',
    title: 'Enterprise Architecture',
    paragraphs: [
      "L'architecture d'entreprise met en cohérence les systèmes d'information avec la stratégie et les contraintes d'une organisation dans son ensemble. Elle exige une vision transverse rarement enseignée avec la même rigueur que les compétences purement techniques.",
    ],
  },
  {
    id: 'cloud-architecture',
    title: 'Cloud Architecture',
    paragraphs: [
      "Le passage massif vers des infrastructures cloud a démultiplié les possibilités d'élasticité et de résilience, mais aussi la complexité des choix d'architecture — modèles de déploiement, répartition des responsabilités avec les fournisseurs, gestion des coûts et des dépendances.",
    ],
  },
  {
    id: 'quality-engineering',
    title: 'Quality Engineering',
    paragraphs: [
      "L'ingénierie de la qualité dépasse la simple détection de défauts : elle structure la manière dont un système est conçu, construit et validé pour répondre de façon fiable à ses exigences, y compris les exigences non fonctionnelles.",
    ],
  },
  {
    id: 'testing-strategies',
    title: 'Testing Strategies',
    paragraphs: [
      'Une stratégie de test rigoureuse combine différents niveaux de vérification — unitaire, intégration, système, non-régression — proportionnés à la criticité du logiciel concerné, plutôt qu’un empilement non coordonné d’outils.',
    ],
  },
  {
    id: 'observability',
    title: 'Observability',
    paragraphs: [
      "L'observabilité — journalisation, métriques, traçage distribué — est devenue une condition de la maîtrise opérationnelle des systèmes complexes. Elle permet de comprendre un comportement en production, et non seulement de le constater après un incident.",
    ],
  },
  {
    id: 'technical-debt',
    title: 'Technical Debt',
    paragraphs: [
      "La dette technique est une réalité inévitable de tout système vivant. Sa gestion responsable suppose de la rendre visible, mesurable et priorisée, plutôt que de la subir silencieusement jusqu'à l'incident.",
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "L'OEI considère la rigueur architecturale et la qualité logicielle comme des compétences professionnelles à part entière, dont la maîtrise devrait être documentée et régulièrement mise à jour au même titre que les compétences de sécurité.",
      "Elle encourage l'adoption de pratiques éprouvées — revues d'architecture, documentation des décisions, tests automatisés — non comme des formalités, mais comme des garanties concrètes de fiabilité pour les utilisateurs finaux des systèmes concernés.",
    ],
  },
];
const ARCHITECTURE_SECTIONS_EN: readonly DomainSection[] = [
  {
    id: 'software-architecture',
    title: 'Software Architecture',
    paragraphs: [
      "Software architecture is the discipline that determines, often for years, a system's ability to evolve, withstand load, and remain understandable to the teams who maintain it. Architectural decisions carry a responsibility that extends well beyond the code written at any given moment.",
    ],
  },
  {
    id: 'enterprise-architecture',
    title: 'Enterprise Architecture',
    paragraphs: [
      "Enterprise architecture aligns information systems with an organization's overall strategy and constraints. It requires a cross-cutting perspective rarely taught with the same rigor as purely technical skills.",
    ],
  },
  {
    id: 'cloud-architecture',
    title: 'Cloud Architecture',
    paragraphs: [
      'The massive shift toward cloud infrastructure has multiplied opportunities for elasticity and resilience, but also the complexity of architectural choices — deployment models, shared responsibility with providers, and managing cost and dependencies.',
    ],
  },
  {
    id: 'quality-engineering',
    title: 'Quality Engineering',
    paragraphs: [
      'Quality engineering goes beyond simply catching defects: it structures how a system is designed, built and validated to reliably meet its requirements, including non-functional ones.',
    ],
  },
  {
    id: 'testing-strategies',
    title: 'Testing Strategies',
    paragraphs: [
      'A rigorous test strategy combines different levels of verification — unit, integration, system, regression — proportionate to the criticality of the software concerned, rather than an uncoordinated stack of tools.',
    ],
  },
  {
    id: 'observability',
    title: 'Observability',
    paragraphs: [
      'Observability — logging, metrics, distributed tracing — has become a precondition for operating complex systems with confidence. It allows teams to understand behavior in production, not merely observe it after an incident.',
    ],
  },
  {
    id: 'technical-debt',
    title: 'Technical Debt',
    paragraphs: [
      'Technical debt is an unavoidable reality of any living system. Managing it responsibly means making it visible, measurable and prioritized, rather than silently enduring it until an incident forces the issue.',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      'The OEI regards architectural rigor and software quality as professional competencies in their own right, whose mastery should be documented and regularly updated on par with security skills.',
      'It encourages the adoption of proven practices — architecture reviews, decision documentation, automated testing — not as formalities, but as concrete guarantees of reliability for the end users of the systems concerned.',
    ],
  },
];

// ============================================================================================
// Green IT / Informatique Verte
// ============================================================================================
const GREEN_IT_SECTIONS_FR: readonly DomainSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    paragraphs: [
      "Le numérique n'est pas immatériel : la fabrication des équipements, la consommation énergétique des centres de données et l'obsolescence des matériels ont un impact environnemental réel et croissant.",
      'Les professionnels qui conçoivent les logiciels et les infrastructures ont une responsabilité directe dans la maîtrise de cet impact, au même titre que les décideurs qui les commanditent.',
    ],
  },
  {
    id: 'digital-carbon-footprint',
    title: 'Digital Carbon Footprint',
    paragraphs: [
      "L'empreinte carbone du numérique se répartit entre la fabrication des équipements, leur usage et leur fin de vie. Une part significative de cet impact est déterminée dès la conception — choix d'architecture, de langages, de dépendances — bien avant la mise en production.",
    ],
  },
  {
    id: 'sustainable-software',
    title: 'Sustainable Software',
    paragraphs: [
      'Un logiciel durable est un logiciel conçu pour consommer sobrement les ressources qu’il mobilise — calcul, mémoire, réseau, stockage — sans sacrifier la qualité de service rendue à ses utilisateurs.',
    ],
  },
  {
    id: 'energy-efficiency',
    title: 'Energy Efficiency',
    paragraphs: [
      "L'efficacité énergétique du code, des algorithmes et des infrastructures qui les exécutent reste un critère largement absent des pratiques actuelles de développement. Elle mérite une attention comparable à celle portée à la performance ou à la sécurité.",
    ],
  },
  {
    id: 'infrastructure-optimization',
    title: 'Infrastructure Optimization',
    paragraphs: [
      "L'optimisation des infrastructures — dimensionnement, virtualisation, mutualisation des ressources — permet de réduire sensiblement la consommation énergétique sans dégrader la disponibilité des services.",
    ],
  },
  {
    id: 'cloud-sustainability',
    title: 'Cloud Sustainability',
    paragraphs: [
      "Le cloud déplace une partie de la responsabilité environnementale vers les fournisseurs d'infrastructure, mais ne l'annule pas : le choix des régions, des services et des architectures reste déterminant pour l'empreinte réelle d'un système.",
    ],
  },
  {
    id: 'measurement-metrics',
    title: 'Measurement & Metrics',
    paragraphs: [
      "Sans mesure fiable, la sobriété numérique reste une intention plutôt qu'une pratique. Le développement d'indicateurs partagés et comparables est une condition préalable à tout progrès vérifiable.",
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "L'OEI considère l'informatique verte comme une dimension intégrante de la responsabilité professionnelle, et non comme une option marketing. Elle appelle à intégrer des critères de sobriété numérique dans les compétences attendues des architectes et des développeurs.",
      "Sans céder à un discours culpabilisant, l'OEI entend promouvoir des pratiques concrètes et mesurables, à la portée de toute organisation, quelle que soit sa taille.",
    ],
  },
];
const GREEN_IT_SECTIONS_EN: readonly DomainSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    paragraphs: [
      'Digital technology is not immaterial: manufacturing equipment, the energy consumption of data centers, and hardware obsolescence all carry a real and growing environmental impact.',
      'Professionals who design software and infrastructure bear a direct responsibility for managing that impact, just as much as the decision-makers who commission it.',
    ],
  },
  {
    id: 'digital-carbon-footprint',
    title: 'Digital Carbon Footprint',
    paragraphs: [
      'The carbon footprint of digital technology is split between manufacturing equipment, its use, and its end of life. A significant share of that impact is determined at design time — architecture, language and dependency choices — well before a system reaches production.',
    ],
  },
  {
    id: 'sustainable-software',
    title: 'Sustainable Software',
    paragraphs: [
      'Sustainable software is software designed to use the resources it consumes — compute, memory, network, storage — sparingly, without sacrificing the quality of service delivered to its users.',
    ],
  },
  {
    id: 'energy-efficiency',
    title: 'Energy Efficiency',
    paragraphs: [
      'The energy efficiency of code, algorithms and the infrastructure that runs them remains largely absent from current development practices. It deserves attention comparable to that given to performance or security.',
    ],
  },
  {
    id: 'infrastructure-optimization',
    title: 'Infrastructure Optimization',
    paragraphs: [
      'Optimizing infrastructure — right-sizing, virtualization, resource pooling — can meaningfully reduce energy consumption without degrading service availability.',
    ],
  },
  {
    id: 'cloud-sustainability',
    title: 'Cloud Sustainability',
    paragraphs: [
      "The cloud shifts part of the environmental responsibility to infrastructure providers, but does not eliminate it: the choice of regions, services and architectures still determines a system's real footprint.",
    ],
  },
  {
    id: 'measurement-metrics',
    title: 'Measurement & Metrics',
    paragraphs: [
      'Without reliable measurement, digital sobriety remains an intention rather than a practice. Developing shared, comparable indicators is a precondition for any verifiable progress.',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      'The OEI regards Green IT as an integral part of professional responsibility, not a marketing option. It calls for digital sobriety criteria to be included among the competencies expected of architects and developers.',
      'Without resorting to guilt-driven rhetoric, the OEI intends to promote concrete, measurable practices, within reach of any organization regardless of its size.',
    ],
  },
];

// ============================================================================================
// Data Protection / Protection des Données
// ============================================================================================
const DATA_SECTIONS_FR: readonly DomainSection[] = [
  {
    id: 'why-data-matters',
    title: 'Why Data Matters',
    paragraphs: [
      "Les données personnelles sont devenues une matière première économique majeure, mais elles restent avant tout des informations qui engagent la vie privée, la sécurité et parfois la dignité des personnes qu'elles concernent.",
      'Le professionnel qui conçoit un système de traitement de données porte une responsabilité directe sur la manière dont ces informations sont collectées, utilisées et protégées.',
    ],
  },
  {
    id: 'privacy-by-design',
    title: 'Privacy by Design',
    paragraphs: [
      "La protection de la vie privée dès la conception impose de penser la minimisation des données, le consentement et la sécurité avant même d'écrire la première ligne de code d'un système, et non comme une couche ajoutée après coup.",
    ],
  },
  {
    id: 'gdpr',
    title: 'GDPR',
    paragraphs: [
      "Le règlement général sur la protection des données (RGPD) a posé, à l'échelle européenne, un cadre de référence désormais observé bien au-delà de l'Union européenne, tant par son influence sur d'autres réglementations que par son application aux organisations traitant des données de résidents européens.",
    ],
  },
  {
    id: 'international-regulations',
    title: 'International Regulations',
    paragraphs: [
      'De nombreuses juridictions ont développé leurs propres cadres de protection des données, avec des exigences parfois convergentes, parfois distinctes. Les professionnels opérant à l’international doivent composer avec cette pluralité plutôt que l’ignorer.',
    ],
  },
  {
    id: 'data-governance',
    title: 'Data Governance',
    paragraphs: [
      'La gouvernance des données organise les responsabilités, les processus et les contrôles qui garantissent la qualité, la sécurité et la conformité des données tout au long de leur cycle de vie au sein d’une organisation.',
    ],
  },
  {
    id: 'data-classification',
    title: 'Data Classification',
    paragraphs: [
      'La classification des données selon leur sensibilité — publiques, internes, confidentielles, hautement sensibles — permet d’appliquer des mesures de protection proportionnées, plutôt qu’un traitement uniforme inadapté à la réalité des risques.',
    ],
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    paragraphs: [
      'La durée de conservation des données doit être définie, justifiée et respectée : conserver des données au-delà de leur finalité légitime constitue un risque, non une précaution.',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "L'OEI considère la protection des données comme un devoir professionnel fondamental, indissociable de la compétence technique. Un système mal conçu sur ce plan n'est pas seulement non conforme : il expose des personnes réelles à un préjudice réel.",
      "L'OEI encourage l'adoption systématique des principes de minimisation, de transparence et de sécurité des données, comme des standards professionnels communs plutôt que comme de simples obligations réglementaires locales.",
    ],
  },
];
const DATA_SECTIONS_EN: readonly DomainSection[] = [
  {
    id: 'why-data-matters',
    title: 'Why Data Matters',
    paragraphs: [
      'Personal data has become a major economic raw material, but it remains, first and foremost, information that bears on the privacy, security, and sometimes the dignity, of the people it concerns.',
      'A professional who designs a data-processing system carries direct responsibility for how that information is collected, used and protected.',
    ],
  },
  {
    id: 'privacy-by-design',
    title: 'Privacy by Design',
    paragraphs: [
      'Privacy by design requires thinking through data minimization, consent and security before the first line of a system’s code is written — not as a layer bolted on afterward.',
    ],
  },
  {
    id: 'gdpr',
    title: 'GDPR',
    paragraphs: [
      "The General Data Protection Regulation (GDPR) established a European reference framework now observed well beyond the EU, both through its influence on other regulations and through its application to organizations processing EU residents' data.",
    ],
  },
  {
    id: 'international-regulations',
    title: 'International Regulations',
    paragraphs: [
      'Many jurisdictions have developed their own data protection frameworks, with requirements that sometimes converge and sometimes diverge. Professionals operating internationally must work with this plurality rather than ignore it.',
    ],
  },
  {
    id: 'data-governance',
    title: 'Data Governance',
    paragraphs: [
      'Data governance organizes the responsibilities, processes and controls that guarantee the quality, security and compliance of data throughout its lifecycle within an organization.',
    ],
  },
  {
    id: 'data-classification',
    title: 'Data Classification',
    paragraphs: [
      'Classifying data by sensitivity — public, internal, confidential, highly sensitive — allows proportionate protection measures to be applied, rather than a uniform treatment ill-suited to the real risks involved.',
    ],
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    paragraphs: [
      'How long data is kept must be defined, justified and respected: keeping data beyond its legitimate purpose is a risk, not a precaution.',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      'The OEI regards data protection as a fundamental professional duty, inseparable from technical competence. A system poorly designed on this front is not merely non-compliant: it exposes real people to real harm.',
      'The OEI encourages the systematic adoption of data minimization, transparency and security principles as shared professional standards, rather than as mere local regulatory obligations.',
    ],
  },
];

// ============================================================================================
// Critical Software / Logiciels Critiques
// ============================================================================================
const CRITIQUES_SECTIONS_FR: readonly DomainSection[] = [
  {
    id: 'definition',
    title: 'Definition',
    paragraphs: [
      "Un logiciel critique est un système dont la défaillance peut causer un préjudice grave — atteinte à la sécurité des personnes, perturbation majeure d'un service essentiel, perte financière significative. Cette définition dépasse le seul secteur d'activité : un même type de logiciel peut être critique dans un contexte et ne pas l'être dans un autre.",
    ],
  },
  {
    id: 'aviation',
    title: 'Aviation',
    paragraphs: [
      "L'aviation civile a développé, depuis des décennies, certaines des méthodes les plus rigoureuses de conception et de certification de logiciels embarqués. Ces pratiques constituent une référence utile bien au-delà du secteur aéronautique.",
    ],
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    paragraphs: [
      "Les logiciels médicaux — dispositifs connectés, systèmes de dossier patient, outils d'aide à la décision clinique — exigent un niveau de fiabilité directement lié à la sécurité des patients, avec des exigences réglementaires spécifiques selon les juridictions.",
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    paragraphs: [
      "Les systèmes financiers combinent des exigences de disponibilité, d'intégrité des transactions et de résistance à la fraude, dans un environnement où une défaillance peut affecter simultanément un très grand nombre de personnes.",
    ],
  },
  {
    id: 'energy',
    title: 'Energy',
    paragraphs: [
      "Les systèmes de gestion des réseaux électriques et énergétiques relèvent d'infrastructures essentielles dont la continuité conditionne le fonctionnement de l'ensemble des autres secteurs d'une société moderne.",
    ],
  },
  {
    id: 'public-services',
    title: 'Public Services',
    paragraphs: [
      "Les services publics numériques — état civil, fiscalité, protection sociale — gèrent des données sensibles et rendent des services dont l'indisponibilité affecte directement les citoyens, souvent parmi les plus vulnérables.",
    ],
  },
  {
    id: 'reliability-engineering',
    title: 'Reliability Engineering',
    paragraphs: [
      "L'ingénierie de la fiabilité formalise la manière de concevoir des systèmes tolérants aux pannes, de mesurer leur disponibilité réelle et de réduire méthodiquement les défaillances plutôt que de simplement les corriger après coup.",
    ],
  },
  {
    id: 'safety-standards',
    title: 'Safety Standards',
    paragraphs: [
      "De nombreux référentiels sectoriels — normes de sûreté fonctionnelle, exigences de certification propres à chaque domaine — encadrent la conception des logiciels critiques. Leur point commun est d'exiger une traçabilité rigoureuse entre exigences, conception et validation.",
    ],
  },
  {
    id: 'incident-analysis',
    title: 'Incident Analysis',
    paragraphs: [
      "L'analyse rigoureuse des incidents, sans recherche de bouc émissaire, reste l'un des moyens les plus efficaces d'améliorer durablement la fiabilité des systèmes critiques et d'éviter la répétition des mêmes défaillances.",
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "L'OEI considère que les professionnels intervenant sur des logiciels critiques portent une responsabilité particulière, à la mesure des conséquences potentielles de leurs décisions techniques sur la sécurité des personnes.",
      'Elle plaide pour une reconnaissance différenciée des compétences requises sur ces systèmes, sans pour autant proposer un cadre uniforme qui ignorerait la diversité des secteurs et des contextes réglementaires concernés.',
    ],
  },
];
const CRITIQUES_SECTIONS_EN: readonly DomainSection[] = [
  {
    id: 'definition',
    title: 'Definition',
    paragraphs: [
      "Critical software is a system whose failure can cause serious harm — a threat to people's safety, a major disruption of an essential service, or significant financial loss. This definition goes beyond any single industry: the same type of software can be critical in one context and not in another.",
    ],
  },
  {
    id: 'aviation',
    title: 'Aviation',
    paragraphs: [
      'Civil aviation has, for decades, developed some of the most rigorous methods for designing and certifying embedded software. These practices remain a useful reference well beyond the aerospace sector.',
    ],
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    paragraphs: [
      'Medical software — connected devices, patient record systems, clinical decision-support tools — requires a level of reliability directly tied to patient safety, with regulatory requirements that vary by jurisdiction.',
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    paragraphs: [
      'Financial systems combine requirements for availability, transaction integrity and fraud resistance, in an environment where a single failure can simultaneously affect a very large number of people.',
    ],
  },
  {
    id: 'energy',
    title: 'Energy',
    paragraphs: [
      'Power grid and energy management systems are essential infrastructure whose continuity underpins the functioning of every other sector of a modern society.',
    ],
  },
  {
    id: 'public-services',
    title: 'Public Services',
    paragraphs: [
      'Digital public services — civil registry, taxation, social protection — handle sensitive data and deliver services whose unavailability directly affects citizens, often among the most vulnerable.',
    ],
  },
  {
    id: 'reliability-engineering',
    title: 'Reliability Engineering',
    paragraphs: [
      'Reliability engineering formalizes how to design fault-tolerant systems, measure their real availability, and methodically reduce failures rather than simply fixing them after the fact.',
    ],
  },
  {
    id: 'safety-standards',
    title: 'Safety Standards',
    paragraphs: [
      'Numerous sector-specific frameworks — functional safety standards, domain-specific certification requirements — govern the design of critical software. What they share is a requirement for rigorous traceability between requirements, design and validation.',
    ],
  },
  {
    id: 'incident-analysis',
    title: 'Incident Analysis',
    paragraphs: [
      'Rigorous incident analysis, without scapegoating, remains one of the most effective ways to durably improve the reliability of critical systems and prevent the same failures from recurring.',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "The OEI holds that professionals working on critical software carry a particular responsibility, proportionate to the potential consequences of their technical decisions on people's safety.",
      'It advocates for differentiated recognition of the competencies required on these systems, without proposing a uniform framework that would ignore the diversity of sectors and regulatory contexts involved.',
    ],
  },
];

// ============================================================================================
// Ethics & Society / Éthique & Société
// ============================================================================================
const ETHIQUE_SECTIONS_FR: readonly DomainSection[] = [
  {
    id: 'why-ethics-matters',
    title: 'Why Ethics Matters',
    paragraphs: [
      'Les choix techniques ne sont jamais neutres : ils incorporent des priorités, des compromis et parfois des angles morts qui affectent directement les personnes qui utilisent, ou subissent, les systèmes numériques.',
      "L'éthique informatique n'est pas un supplément moral facultatif : c'est une dimension constitutive d'une pratique professionnelle responsable.",
    ],
  },
  {
    id: 'public-interest-software',
    title: 'Public Interest Software',
    paragraphs: [
      "Certains logiciels servent directement l'intérêt général — infrastructures publiques, services essentiels, biens communs numériques. Leur conception mérite une attention particulière aux arbitrages entre efficacité, équité et transparence.",
    ],
  },
  {
    id: 'human-rights',
    title: 'Human Rights',
    paragraphs: [
      'Les systèmes numériques peuvent renforcer ou fragiliser des droits fondamentaux — liberté d’expression, vie privée, non-discrimination. Les professionnels qui les conçoivent doivent être en mesure d’identifier ces effets, même lorsqu’ils ne sont pas recherchés.',
    ],
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    paragraphs: [
      "L'accessibilité numérique garantit que les personnes en situation de handicap peuvent utiliser un service dans des conditions équivalentes aux autres utilisateurs. Elle relève d'une exigence de conception, non d'une option ajoutée en fin de projet.",
    ],
  },
  {
    id: 'inclusion',
    title: 'Inclusion',
    paragraphs: [
      'Un numérique inclusif prend en compte la diversité réelle de ses utilisateurs — langues, cultures, niveaux de littératie numérique, conditions d’accès — plutôt que de concevoir pour un utilisateur moyen fictif.',
    ],
  },
  {
    id: 'algorithmic-fairness',
    title: 'Algorithmic Fairness',
    paragraphs: [
      "L'équité algorithmique interroge la manière dont des systèmes automatisés peuvent reproduire ou amplifier des discriminations existantes, souvent sans intention explicite de leurs concepteurs, ce qui rend leur détection d'autant plus nécessaire.",
    ],
  },
  {
    id: 'professional-responsibility',
    title: 'Professional Responsibility',
    paragraphs: [
      'La responsabilité professionnelle suppose la capacité, et parfois le courage, de signaler un choix technique problématique, y compris lorsque ce choix est porté par une hiérarchie ou un client.',
    ],
  },
  {
    id: 'future-challenges',
    title: 'Future Challenges',
    paragraphs: [
      'Les prochaines années verront émerger de nouveaux dilemmes éthiques, à mesure que les systèmes numériques prennent en charge des décisions toujours plus sensibles pour les individus et les sociétés.',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "L'OEI considère l'éthique professionnelle comme un pilier constitutif de la profession informatique, au même titre que la compétence technique. Le Code de déontologie de l'OEI en pose les principes fondateurs.",
      "En tant que mouvement fondateur porté par une association, l'OEI n'a pas vocation à sanctionner au sens légal du terme, mais à faire vivre, promouvoir et faire reconnaître progressivement un ensemble d'exigences éthiques partagées par la communauté professionnelle internationale.",
    ],
  },
];
const ETHIQUE_SECTIONS_EN: readonly DomainSection[] = [
  {
    id: 'why-ethics-matters',
    title: 'Why Ethics Matters',
    paragraphs: [
      'Technical choices are never neutral: they embed priorities, trade-offs and sometimes blind spots that directly affect the people who use, or are subjected to, digital systems.',
      'Computing ethics is not an optional moral add-on: it is a constitutive dimension of responsible professional practice.',
    ],
  },
  {
    id: 'public-interest-software',
    title: 'Public Interest Software',
    paragraphs: [
      'Some software directly serves the public interest — public infrastructure, essential services, digital commons. Designing it deserves particular attention to the trade-offs between efficiency, fairness and transparency.',
    ],
  },
  {
    id: 'human-rights',
    title: 'Human Rights',
    paragraphs: [
      'Digital systems can strengthen or undermine fundamental rights — freedom of expression, privacy, non-discrimination. The professionals who design them must be able to identify these effects, even when they are unintended.',
    ],
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    paragraphs: [
      'Digital accessibility ensures that people with disabilities can use a service on terms equivalent to other users. It is a design requirement, not an option tacked on at the end of a project.',
    ],
  },
  {
    id: 'inclusion',
    title: 'Inclusion',
    paragraphs: [
      'Inclusive technology accounts for the real diversity of its users — languages, cultures, levels of digital literacy, access conditions — rather than designing for a fictional average user.',
    ],
  },
  {
    id: 'algorithmic-fairness',
    title: 'Algorithmic Fairness',
    paragraphs: [
      'Algorithmic fairness examines how automated systems can reproduce or amplify existing discrimination, often without any explicit intent from their designers — which makes detecting it all the more necessary.',
    ],
  },
  {
    id: 'professional-responsibility',
    title: 'Professional Responsibility',
    paragraphs: [
      'Professional responsibility requires the ability, and sometimes the courage, to flag a problematic technical choice, even when that choice is championed by management or a client.',
    ],
  },
  {
    id: 'future-challenges',
    title: 'Future Challenges',
    paragraphs: [
      'The coming years will bring new ethical dilemmas as digital systems take on increasingly sensitive decisions affecting individuals and societies.',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "The OEI regards professional ethics as a constitutive pillar of the IT profession, on par with technical competence. The OEI's Code of Ethics sets out its founding principles.",
      'As a founding movement backed by an association, the OEI is not meant to sanction in the legal sense, but to sustain, promote and progressively secure recognition for a set of ethical requirements shared by the international professional community.',
    ],
  },
];

// ============================================================================================
// Standards & Professional Practices / Normes & Pratiques Professionnelles (9th domain)
// ============================================================================================
const NORMES_SECTIONS_FR: readonly DomainSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    paragraphs: [
      "L'informatique dispose déjà de l'un des corpus de normes techniques les plus riches au monde — protocoles réseau, formats d'échange, algorithmes, exigences de sûreté logicielle. Ce que cette page documente n'est pas un vide normatif, mais un usage encore inégal de ces standards par la profession elle-même.",
      "L'OEI ne cherche pas à créer de nouvelles normes techniques : elle cherche à en promouvoir l'adoption effective, et à relier ces standards à une pratique professionnelle quotidienne cohérente.",
    ],
  },
  {
    id: 'international-standards',
    title: 'International Standards',
    paragraphs: [
      "Des organisations telles que l'ISO, l'IEEE et l'ACM produisent depuis des décennies des référentiels techniques et professionnels reconnus internationalement. Leur portée reste toutefois largement déterminée par le volontariat des organisations et des individus qui choisissent, ou non, de s'y conformer.",
    ],
    bullets: [
      'ISO/IEC — normes de management et de sécurité de l’information',
      'IEEE — normes techniques et standards logiciels',
      "ACM — code d'éthique et de conduite professionnelle en informatique",
    ],
  },
  {
    id: 'open-source-and-open-protocols',
    title: 'Open Source & Open Protocols',
    paragraphs: [
      "L'écosystème open source et les standards ouverts — protocoles définis par des RFC, interfaces documentées via OpenAPI — incarnent une tradition de transparence et de collaboration que l'OEI considère comme un modèle pour la profession dans son ensemble, et non comme un simple choix technique parmi d'autres.",
    ],
    bullets: [
      'Logiciels et communautés open source',
      'RFC et standardisation ouverte des protocoles Internet',
      "Spécifications OpenAPI pour l'interopérabilité des services",
    ],
  },
  {
    id: 'security-practices',
    title: 'Security Practices',
    paragraphs: [
      "Des référentiels comme l'OWASP structurent, de façon pragmatique et largement partagée, les bonnes pratiques de sécurité applicative. Leur adoption reste pourtant loin d'être systématique dans les organisations, y compris sur des systèmes exposés au public.",
    ],
  },
  {
    id: 'engineering-practices',
    title: 'Engineering Practices',
    paragraphs: [
      "Au-delà des normes formelles, un ensemble de pratiques d'ingénierie — documentation des décisions d'architecture (ADR), revues de code systématiques, exigences de qualité logicielle mesurables — constitue le socle quotidien d'une pratique professionnelle rigoureuse.",
    ],
    bullets: [
      'Architecture Decision Records (ADR)',
      'Revues de code systématiques',
      'Documentation technique maintenue à jour',
      'Mesure continue de la qualité logicielle',
    ],
  },
  {
    id: 'technical-governance',
    title: 'Technical Governance',
    paragraphs: [
      "La gouvernance technique organise la manière dont une organisation décide, documente et fait respecter ses choix d'architecture et ses standards internes. Elle est souvent absente ou informelle dans les organisations de petite taille, ce qui fragilise la cohérence de leurs systèmes dans le temps.",
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "L'ambition de l'OEI n'est pas de réglementer la technologie, mais de promouvoir l'adoption de standards professionnels communs à l'échelle internationale — norme par norme, pratique par pratique, plutôt que par un cadre unique imposé d'en haut.",
      "Cette page relie directement le Livre Blanc de l'OEI à son idée centrale : une profession qui s'appuie sur des standards partagés, documentés et vérifiables gagne en crédibilité sans avoir besoin d'un statut légal pour y prétendre.",
    ],
  },
];
const NORMES_SECTIONS_EN: readonly DomainSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    paragraphs: [
      'IT already has one of the richest bodies of technical standards in the world — network protocols, exchange formats, algorithms, software safety requirements. What this page documents is not a normative void, but an still-uneven use of these standards by the profession itself.',
      'The OEI is not trying to create new technical standards: it seeks to promote their effective adoption, and to connect them to a coherent, everyday professional practice.',
    ],
  },
  {
    id: 'international-standards',
    title: 'International Standards',
    paragraphs: [
      'Organizations such as ISO, IEEE and ACM have produced internationally recognized technical and professional frameworks for decades. Their reach, however, remains largely determined by the voluntary choice of organizations and individuals to comply with them, or not.',
    ],
    bullets: [
      'ISO/IEC — information security and management standards',
      'IEEE — technical and software standards',
      'ACM — code of ethics and professional conduct in computing',
    ],
  },
  {
    id: 'open-source-and-open-protocols',
    title: 'Open Source & Open Protocols',
    paragraphs: [
      'The open source ecosystem and open standards — protocols defined by RFCs, interfaces documented via OpenAPI — embody a tradition of transparency and collaboration that the OEI considers a model for the profession as a whole, not merely one technical choice among others.',
    ],
    bullets: [
      'Open source software and communities',
      'RFCs and open standardization of Internet protocols',
      'OpenAPI specifications for service interoperability',
    ],
  },
  {
    id: 'security-practices',
    title: 'Security Practices',
    paragraphs: [
      'Frameworks such as OWASP structure application security best practices in a pragmatic, widely shared way. Yet their adoption remains far from systematic across organizations, including on systems exposed to the public.',
    ],
  },
  {
    id: 'engineering-practices',
    title: 'Engineering Practices',
    paragraphs: [
      'Beyond formal standards, a set of engineering practices — Architecture Decision Records (ADRs), systematic code review, measurable software quality requirements — forms the everyday foundation of rigorous professional practice.',
    ],
    bullets: [
      'Architecture Decision Records (ADRs)',
      'Systematic code review',
      'Technical documentation kept up to date',
      'Continuous measurement of software quality',
    ],
  },
  {
    id: 'technical-governance',
    title: 'Technical Governance',
    paragraphs: [
      'Technical governance organizes how an organization decides on, documents and enforces its architectural choices and internal standards. It is often absent or informal in smaller organizations, which weakens the consistency of their systems over time.',
    ],
  },
  {
    id: 'oei-position',
    title: 'OEI Position',
    paragraphs: [
      "The OEI's ambition is not to regulate technology, but to promote the adoption of shared professional standards internationally — one standard, one practice at a time, rather than through a single framework imposed from above.",
      "This page directly connects the OEI's White Paper to its central idea: a profession built on shared, documented, verifiable standards gains credibility without needing a legal status to claim it.",
    ],
  },
];

// Localized per language (same pattern as `ContentMockAdapter`/`StatsMockAdapter`): each entry
// below is a full translation of the same nine domains, not a French copy duplicated per key.
const FIXTURES: Record<SupportedLanguage, DomainArea[]> = {
  fr: [
    createDomainArea({
      slug: 'cybersecurite',
      icon: 'shield-lock',
      title: 'Cybersécurité',
      description: 'Renforcer la résilience des systèmes face aux menaces numériques.',
      lastModified: '2026-07-12',
      subtitle:
        'Protéger les infrastructures numériques, les systèmes critiques et la confiance publique.',
      sections: CYBERSECURITE_SECTIONS_FR,
      relatedResources: RELATED_RESOURCES_FR,
      relatedNews: relatedNewsFr('Cybersécurité'),
    }),
    createDomainArea({
      slug: 'intelligence-artificielle',
      icon: 'brain',
      title: 'Intelligence Artificielle',
      description: "Encadrer le développement et l'usage responsable de l'IA.",
      lastModified: '2026-07-28',
      subtitle:
        "Encadrer le développement d'une intelligence artificielle digne de confiance, au service de l'intérêt général.",
      sections: IA_SECTIONS_FR,
      relatedResources: RELATED_RESOURCES_FR,
      relatedNews: relatedNewsFr('Intelligence Artificielle'),
    }),
    createDomainArea({
      slug: 'informatique-verte',
      icon: 'leaf',
      title: 'Informatique Verte',
      description: "Réduire l'empreinte environnementale du numérique.",
      lastModified: '2026-06-30',
      subtitle:
        "Réduire l'empreinte environnementale du numérique, à chaque étape du cycle de vie des systèmes.",
      sections: GREEN_IT_SECTIONS_FR,
      relatedResources: RELATED_RESOURCES_FR,
      relatedNews: relatedNewsFr('Informatique Verte'),
    }),
    createDomainArea({
      slug: 'logiciels-critiques',
      icon: 'lock',
      title: 'Logiciels Critiques',
      description: 'Garantir la fiabilité des logiciels essentiels à la société.',
      lastModified: '2026-05-18',
      subtitle:
        'Garantir la fiabilité des logiciels dont dépend directement la sécurité des personnes.',
      sections: CRITIQUES_SECTIONS_FR,
      relatedResources: RELATED_RESOURCES_FR,
      relatedNews: relatedNewsFr('Logiciels Critiques'),
    }),
    createDomainArea({
      slug: 'formation-continue',
      icon: 'graduation-cap',
      title: 'Formation Continue',
      description: 'Accompagner la montée en compétence tout au long de la carrière.',
      lastModified: '2026-07-02',
      subtitle:
        'Accompagner la montée en compétence des professionnels du numérique, tout au long de leur carrière.',
      sections: FORMATION_SECTIONS_FR,
      relatedResources: RELATED_RESOURCES_FR,
      relatedNews: relatedNewsFr('Formation Continue'),
    }),
    createDomainArea({
      slug: 'architecture-qualite',
      icon: 'code',
      title: 'Architecture & Qualité',
      description: "Promouvoir des pratiques d'architecture logicielle rigoureuses.",
      lastModified: '2026-04-21',
      subtitle:
        "Promouvoir des pratiques d'architecture et de qualité logicielle rigoureuses, à la hauteur des systèmes qu'elles soutiennent.",
      sections: ARCHITECTURE_SECTIONS_FR,
      relatedResources: RELATED_RESOURCES_FR,
      relatedNews: relatedNewsFr('Architecture & Qualité'),
    }),
    createDomainArea({
      slug: 'protection-donnees',
      icon: 'database',
      title: 'Protection des Données',
      description: 'Défendre le respect de la vie privée et des données personnelles.',
      lastModified: '2026-06-09',
      subtitle:
        'Défendre la vie privée et la protection des données personnelles comme des droits fondamentaux du numérique.',
      sections: DATA_SECTIONS_FR,
      relatedResources: RELATED_RESOURCES_FR,
      relatedNews: relatedNewsFr('Protection des Données'),
    }),
    createDomainArea({
      slug: 'ethique-societe',
      icon: 'users',
      title: 'Éthique & Société',
      description: "Interroger l'impact du numérique sur l'humain et la société.",
      lastModified: '2026-07-20',
      subtitle:
        "Interroger l'impact du numérique sur les personnes et la société, et affirmer la responsabilité de ceux qui le construisent.",
      sections: ETHIQUE_SECTIONS_FR,
      relatedResources: RELATED_RESOURCES_FR,
      relatedNews: relatedNewsFr('Éthique & Société'),
    }),
    createDomainArea({
      slug: 'normes-pratiques',
      icon: 'book-open',
      title: 'Normes & Pratiques Professionnelles',
      description:
        'Faire le lien entre les standards techniques internationaux et une pratique professionnelle rigoureuse et partagée.',
      lastModified: '2026-08-05',
      subtitle:
        'Promouvoir l’adoption de standards professionnels communs, à l’échelle internationale, plutôt que réglementer la technologie.',
      sections: NORMES_SECTIONS_FR,
      relatedResources: RELATED_RESOURCES_FR,
      relatedNews: relatedNewsFr('Normes & Pratiques Professionnelles'),
    }),
  ],
  en: [
    createDomainArea({
      slug: 'cybersecurite',
      icon: 'shield-lock',
      title: 'Cybersecurity',
      description: "Strengthen systems' resilience against digital threats.",
      lastModified: '2026-07-12',
      subtitle: 'Protecting digital infrastructures, critical systems and public trust.',
      sections: CYBERSECURITE_SECTIONS_EN,
      relatedResources: RELATED_RESOURCES_EN,
      relatedNews: relatedNewsEn('Cybersecurity'),
    }),
    createDomainArea({
      slug: 'intelligence-artificielle',
      icon: 'brain',
      title: 'Artificial Intelligence',
      description: 'Frame the responsible development and use of AI.',
      lastModified: '2026-07-28',
      subtitle:
        'Guiding the development of trustworthy artificial intelligence in the public interest.',
      sections: IA_SECTIONS_EN,
      relatedResources: RELATED_RESOURCES_EN,
      relatedNews: relatedNewsEn('Artificial Intelligence'),
    }),
    createDomainArea({
      slug: 'informatique-verte',
      icon: 'leaf',
      title: 'Green IT',
      description: "Reduce technology's environmental footprint.",
      lastModified: '2026-06-30',
      subtitle:
        "Reducing technology's environmental footprint, at every stage of a system's lifecycle.",
      sections: GREEN_IT_SECTIONS_EN,
      relatedResources: RELATED_RESOURCES_EN,
      relatedNews: relatedNewsEn('Green IT'),
    }),
    createDomainArea({
      slug: 'logiciels-critiques',
      icon: 'lock',
      title: 'Critical Software',
      description: "Guarantee the reliability of society's essential software.",
      lastModified: '2026-05-18',
      subtitle:
        "Guaranteeing the reliability of software on which people's safety directly depends.",
      sections: CRITIQUES_SECTIONS_EN,
      relatedResources: RELATED_RESOURCES_EN,
      relatedNews: relatedNewsEn('Critical Software'),
    }),
    createDomainArea({
      slug: 'formation-continue',
      icon: 'graduation-cap',
      title: 'Continuing Education',
      description: 'Support skills development throughout a career.',
      lastModified: '2026-07-02',
      subtitle: "Supporting IT professionals' growth in competence throughout their careers.",
      sections: FORMATION_SECTIONS_EN,
      relatedResources: RELATED_RESOURCES_EN,
      relatedNews: relatedNewsEn('Continuing Education'),
    }),
    createDomainArea({
      slug: 'architecture-qualite',
      icon: 'code',
      title: 'Architecture & Quality',
      description: 'Promote rigorous software architecture practices.',
      lastModified: '2026-04-21',
      subtitle:
        'Promoting rigorous software architecture and quality practices, worthy of the systems they support.',
      sections: ARCHITECTURE_SECTIONS_EN,
      relatedResources: RELATED_RESOURCES_EN,
      relatedNews: relatedNewsEn('Architecture & Quality'),
    }),
    createDomainArea({
      slug: 'protection-donnees',
      icon: 'database',
      title: 'Data Protection',
      description: 'Defend privacy and personal data protection.',
      lastModified: '2026-06-09',
      subtitle: 'Defending privacy and personal data protection as fundamental digital rights.',
      sections: DATA_SECTIONS_EN,
      relatedResources: RELATED_RESOURCES_EN,
      relatedNews: relatedNewsEn('Data Protection'),
    }),
    createDomainArea({
      slug: 'ethique-societe',
      icon: 'users',
      title: 'Ethics & Society',
      description: "Question technology's impact on people and society.",
      lastModified: '2026-07-20',
      subtitle:
        "Questioning technology's impact on people and society, and affirming the responsibility of those who build it.",
      sections: ETHIQUE_SECTIONS_EN,
      relatedResources: RELATED_RESOURCES_EN,
      relatedNews: relatedNewsEn('Ethics & Society'),
    }),
    createDomainArea({
      slug: 'normes-pratiques',
      icon: 'book-open',
      title: 'Standards & Professional Practices',
      description:
        'Bridging international technical standards and a rigorous, shared professional practice.',
      lastModified: '2026-08-05',
      subtitle:
        'Promoting the adoption of shared professional standards internationally, rather than regulating technology itself.',
      sections: NORMES_SECTIONS_EN,
      relatedResources: RELATED_RESOURCES_EN,
      relatedNews: relatedNewsEn('Standards & Professional Practices'),
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
      description:
        'Die Auswirkungen der digitalen Technik auf Mensch und Gesellschaft hinterfragen.',
      lastModified: '2026-07-20',
    }),
    createDomainArea({
      slug: 'normes-pratiques',
      icon: 'book-open',
      title: 'Normen & Berufspraktiken',
      description:
        'Internationale technische Standards mit einer strengen, gemeinsamen Berufspraxis verbinden.',
      lastModified: '2026-08-05',
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
    createDomainArea({
      slug: 'normes-pratiques',
      icon: 'book-open',
      title: 'Normas y Prácticas Profesionales',
      description:
        'Conectar los estándares técnicos internacionales con una práctica profesional rigurosa y compartida.',
      lastModified: '2026-08-05',
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
    createDomainArea({
      slug: 'normes-pratiques',
      icon: 'book-open',
      title: 'Norme e Pratiche Professionali',
      description:
        'Collegare gli standard tecnici internazionali a una pratica professionale rigorosa e condivisa.',
      lastModified: '2026-08-05',
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
    createDomainArea({
      slug: 'normes-pratiques',
      icon: 'book-open',
      title: 'Normas e Práticas Profissionais',
      description:
        'Ligar os padrões técnicos internacionais a uma prática profissional rigorosa e partilhada.',
      lastModified: '2026-08-05',
    }),
  ],
};

@Service()
export class DomainsMockAdapter implements DomainsPort {
  getDomainAreas(lang: string): Observable<DomainArea[]> {
    return of(FIXTURES[lang as SupportedLanguage] ?? FIXTURES['en']);
  }

  getDomainArea(slug: string, lang: string): Observable<DomainArea> {
    const localized = (FIXTURES[lang as SupportedLanguage] ?? FIXTURES['en']).find(
      (area) => area.slug === slug,
    );
    if (!localized) {
      return throwError(() => new Error(`Unknown domain area slug: ${slug}`));
    }
    // These 9 domain detail pages are FR/EN-only for now (see `DomainArea.sections` doc
    // comment): a language other than fr/en gets its localized title/description/icon (used
    // by the home page's domain grid) but borrows the English editorial body, marked via
    // `isContentFallback` so the detail page can show the same kind of fallback notice already
    // used on the À propos / Livre Blanc pages.
    if (localized.sections || lang === 'fr' || lang === 'en') {
      return of(localized);
    }
    const englishFallback = FIXTURES.en.find((area) => area.slug === slug);
    if (!englishFallback) {
      return of(localized);
    }
    return of(
      createDomainArea({
        ...localized,
        subtitle: englishFallback.subtitle,
        sections: englishFallback.sections,
        relatedResources: englishFallback.relatedResources,
        relatedNews: englishFallback.relatedNews,
        isContentFallback: true,
      }),
    );
  }
}
