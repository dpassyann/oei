/**
 * Fixture data for the `/api/v1/news/:lang` mock route.
 *
 * Kept in sync with `src/app/infrastructure/adapter/news-mock.adapter.ts` for the fields the
 * Angular `NewsItem` model actually consumes (`title`, `excerpt`, `imageUrl`, `path`).
 *
 * `category` and `publishedAt` are served here as bonus fields — they are NOT yet part of the
 * Angular `NewsItem` model (see the note in `news-mock.adapter.ts`), but are included so this
 * standalone HTTP mock already exercises the richer shape a future `/actualites` list/detail
 * page (and the real Spring Boot backend) will likely need.
 *
 * NOTE FOR THE FUTURE SPRING BOOT BACKEND: these three news items are a small fixed list. The
 * real backend should eventually also expose an RSS/Atom feed of these actualités (e.g.
 * `GET /api/public/v1/news/feed.rss`) for external syndication. That is explicitly OUT OF
 * SCOPE for this mock server / frontend work — this comment only documents the intent so it
 * isn't lost. See `mock/README.md` for the same note.
 */
export interface NewsFixture {
  readonly title: string;
  readonly excerpt: string;
  readonly imageUrl: string;
  readonly path: string;
  readonly category:
    | 'article'
    | 'communique'
    | 'livre-blanc'
    | 'rapport'
    | 'evenement'
    | 'consultation'
    | 'appel-a-contribution';
  /** ISO 8601 date string. */
  readonly publishedAt: string;
}

/** lang -> list of news items, most recent first. */
export const NEWS_FIXTURES: Record<string, NewsFixture[]> = {
  fr: [
    {
      title: 'Publication du Livre blanc de l’OEI',
      excerpt:
        "L'Observatoire publie son premier livre blanc, qui pose les fondations éthiques et professionnelles du métier d'informaticien.",
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
      category: 'livre-blanc',
      publishedAt: '2026-07-15',
    },
    {
      title: 'Lancement du site public de l’OEI',
      excerpt:
        "Le site de l'Observatoire des Experts Informaticiens ouvre ses portes pour présenter la mission, les domaines d'action et l'espace membre.",
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
      category: 'evenement',
      publishedAt: '2026-07-28',
    },
    {
      title: 'Appel à contribution : rejoignez les groupes de travail thématiques',
      excerpt:
        "L'OEI invite les professionnels du numérique à contribuer aux groupes de travail sur la cybersécurité, l'IA, l'informatique verte et les autres domaines d'action.",
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
      category: 'appel-a-contribution',
      publishedAt: '2026-08-01',
    },
  ],
  en: [
    {
      title: 'Publication of the OEI White Paper',
      excerpt:
        'The Observatory publishes its first white paper, laying out the ethical and professional foundations of the IT profession.',
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
      category: 'livre-blanc',
      publishedAt: '2026-07-15',
    },
    {
      title: 'Launch of the OEI public website',
      excerpt:
        'The Observatoire des Experts Informaticiens website goes live, presenting the mission, action domains and the member area.',
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
      category: 'evenement',
      publishedAt: '2026-07-28',
    },
    {
      title: 'Call for contributions: join our thematic working groups',
      excerpt:
        'The OEI invites IT professionals to contribute to working groups on cybersecurity, AI, green IT and the other action domains.',
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
      category: 'appel-a-contribution',
      publishedAt: '2026-08-01',
    },
  ],
  de: [
    {
      title: 'Veröffentlichung des OEI-Weißbuchs',
      excerpt:
        'Das Observatorium veröffentlicht sein erstes Weißbuch, das die ethischen und beruflichen Grundlagen des IT-Berufs darlegt.',
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
      category: 'livre-blanc',
      publishedAt: '2026-07-15',
    },
    {
      title: 'Start der öffentlichen Website des OEI',
      excerpt:
        'Die Website des Observatoire des Experts Informaticiens geht online und stellt die Mission, die Handlungsfelder und den Mitgliederbereich vor.',
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
      category: 'evenement',
      publishedAt: '2026-07-28',
    },
    {
      title: 'Aufruf zur Mitarbeit: Treten Sie unseren thematischen Arbeitsgruppen bei',
      excerpt:
        'Das OEI lädt IT-Fachleute ein, sich an Arbeitsgruppen zu Cybersicherheit, KI, grüner IT und den weiteren Handlungsfeldern zu beteiligen.',
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
      category: 'appel-a-contribution',
      publishedAt: '2026-08-01',
    },
  ],
  es: [
    {
      title: 'Publicación del Libro Blanco del OEI',
      excerpt:
        'El Observatorio publica su primer libro blanco, que sienta las bases éticas y profesionales de la profesión informática.',
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
      category: 'livre-blanc',
      publishedAt: '2026-07-15',
    },
    {
      title: 'Lanzamiento del sitio público del OEI',
      excerpt:
        'El sitio del Observatoire des Experts Informaticiens entra en línea, presentando la misión, los ámbitos de acción y el espacio de miembros.',
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
      category: 'evenement',
      publishedAt: '2026-07-28',
    },
    {
      title: 'Convocatoria de contribuciones: únase a nuestros grupos de trabajo temáticos',
      excerpt:
        'El OEI invita a los profesionales de la informática a contribuir en los grupos de trabajo sobre ciberseguridad, IA, informática verde y los demás ámbitos de acción.',
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
      category: 'appel-a-contribution',
      publishedAt: '2026-08-01',
    },
  ],
  it: [
    {
      title: "Pubblicazione del Libro Bianco dell'OEI",
      excerpt:
        "L'Osservatorio pubblica il suo primo libro bianco, che pone le basi etiche e professionali della professione informatica.",
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
      category: 'livre-blanc',
      publishedAt: '2026-07-15',
    },
    {
      title: "Lancio del sito pubblico dell'OEI",
      excerpt:
        "Il sito dell'Observatoire des Experts Informaticiens va online, presentando la missione, gli ambiti d'azione e l'area riservata ai membri.",
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
      category: 'evenement',
      publishedAt: '2026-07-28',
    },
    {
      title: 'Invito a contribuire: unisciti ai nostri gruppi di lavoro tematici',
      excerpt:
        "L'OEI invita i professionisti IT a contribuire ai gruppi di lavoro su cybersicurezza, IA, informatica verde e gli altri ambiti d'azione.",
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
      category: 'appel-a-contribution',
      publishedAt: '2026-08-01',
    },
  ],
  pt: [
    {
      title: 'Publicação do Livro Branco do OEI',
      excerpt:
        'O Observatório publica o seu primeiro livro branco, que estabelece as bases éticas e profissionais da profissão de informática.',
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
      category: 'livre-blanc',
      publishedAt: '2026-07-15',
    },
    {
      title: 'Lançamento do site público do OEI',
      excerpt:
        'O site do Observatoire des Experts Informaticiens entra no ar, apresentando a missão, os domínios de ação e a área de membros.',
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
      category: 'evenement',
      publishedAt: '2026-07-28',
    },
    {
      title: 'Chamada de contribuições: junte-se aos nossos grupos de trabalho temáticos',
      excerpt:
        'O OEI convida os profissionais de TI a contribuírem para os grupos de trabalho sobre cibersegurança, IA, TI verde e os demais domínios de ação.',
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
      category: 'appel-a-contribution',
      publishedAt: '2026-08-01',
    },
  ],
};
