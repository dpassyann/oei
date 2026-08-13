import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NewsPort } from '../../domain/port/news.port';
import { createNewsItem, NewsItem } from '../../domain/model/news-item';
import { SupportedLanguage } from '../../domain/model/document';
import { getApprovedArticleSubmissions } from './article-moderation-mock.adapter';

// Note: ces 3 actualités correspondent à des jalons réels et déjà survenus du projet (le Livre
// blanc existe sous `public/assets/livre-blanc/`, le site public est en cours de construction,
// et les 8 domaines d'action déjà arrêtés cherchent des contributeurs) — ce ne sont pas des
// articles inventés de toutes pièces, contrairement à ce que ferait une fausse actualité de
// démo. Elles restent cependant des données de démonstration tant que le backend Spring Boot
// ne publie pas de vraies actualités.
//
// `NewsItem` (voir `domain/model/news-item.ts`) ne modélise pour l'instant que
// `title`/`excerpt`/`imageUrl`/`path`, ce qui correspond exactement à ce que la section
// "Actualités" de la home page affiche aujourd'hui (voir `home.html`). Le serveur mock Express
// (`mock/src/data/news.ts`) sert volontairement des champs supplémentaires (`category`,
// `publishedAt`) en anticipation d'une future page de détail/liste d'actualités — ils ne sont
// pas dupliqués ici pour ne pas introduire un champ non consommé par le frontend actuel.
//
// Localized per language (same pattern as `ContentMockAdapter`/`StatsMockAdapter`/
// `DomainsMockAdapter`/`PartnerMockAdapter`): each entry below is a full translation of the
// same three news items, not a French copy duplicated per key.
const FIXTURES: Record<SupportedLanguage, NewsItem[]> = {
  fr: [
    createNewsItem({
      title: 'Publication du Livre blanc de l’OEI',
      excerpt:
        "L'Observatoire publie son premier livre blanc, qui pose les fondations éthiques et professionnelles du métier d'informaticien.",
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
    }),
    createNewsItem({
      title: 'Lancement du site public de l’OEI',
      excerpt:
        "Le site de l'Observatoire des Experts de l'Informatique ouvre ses portes pour présenter la mission, les domaines d'action et l'espace membre.",
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
    }),
    createNewsItem({
      title: 'Appel à contribution : rejoignez les groupes de travail thématiques',
      excerpt:
        "L'OEI invite les professionnels du numérique à contribuer aux groupes de travail sur la cybersécurité, l'IA, l'informatique verte et les autres domaines d'action.",
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
    }),
  ],
  en: [
    createNewsItem({
      title: 'Publication of the OEI White Paper',
      excerpt:
        'The Observatory publishes its first white paper, laying out the ethical and professional foundations of the IT profession.',
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
    }),
    createNewsItem({
      title: 'Launch of the OEI public website',
      excerpt:
        'The Observatoire des Experts de l'Informatique website goes live, presenting the mission, action domains and the member area.',
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
    }),
    createNewsItem({
      title: 'Call for contributions: join our thematic working groups',
      excerpt:
        'The OEI invites IT professionals to contribute to working groups on cybersecurity, AI, green IT and the other action domains.',
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
    }),
  ],
  de: [
    createNewsItem({
      title: 'Veröffentlichung des OEI-Weißbuchs',
      excerpt:
        'Das Observatorium veröffentlicht sein erstes Weißbuch, das die ethischen und beruflichen Grundlagen des IT-Berufs darlegt.',
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
    }),
    createNewsItem({
      title: 'Start der öffentlichen Website des OEI',
      excerpt:
        'Die Website des Observatoire des Experts de l'Informatique geht online und stellt die Mission, die Handlungsfelder und den Mitgliederbereich vor.',
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
    }),
    createNewsItem({
      title: 'Aufruf zur Mitarbeit: Treten Sie unseren thematischen Arbeitsgruppen bei',
      excerpt:
        'Das OEI lädt IT-Fachleute ein, sich an Arbeitsgruppen zu Cybersicherheit, KI, grüner IT und den weiteren Handlungsfeldern zu beteiligen.',
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
    }),
  ],
  es: [
    createNewsItem({
      title: 'Publicación del Libro Blanco del OEI',
      excerpt:
        'El Observatorio publica su primer libro blanco, que sienta las bases éticas y profesionales de la profesión informática.',
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
    }),
    createNewsItem({
      title: 'Lanzamiento del sitio público del OEI',
      excerpt:
        'El sitio del Observatoire des Experts de l'Informatique entra en línea, presentando la misión, los ámbitos de acción y el espacio de miembros.',
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
    }),
    createNewsItem({
      title: 'Convocatoria de contribuciones: únase a nuestros grupos de trabajo temáticos',
      excerpt:
        'El OEI invita a los profesionales de la informática a contribuir en los grupos de trabajo sobre ciberseguridad, IA, informática verde y los demás ámbitos de acción.',
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
    }),
  ],
  it: [
    createNewsItem({
      title: "Pubblicazione del Libro Bianco dell'OEI",
      excerpt:
        "L'Osservatorio pubblica il suo primo libro bianco, che pone le basi etiche e professionali della professione informatica.",
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
    }),
    createNewsItem({
      title: "Lancio del sito pubblico dell'OEI",
      excerpt:
        "Il sito dell'Observatoire des Experts de l'Informatique va online, presentando la missione, gli ambiti d'azione e l'area riservata ai membri.",
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
    }),
    createNewsItem({
      title: 'Invito a contribuire: unisciti ai nostri gruppi di lavoro tematici',
      excerpt:
        "L'OEI invita i professionisti IT a contribuire ai gruppi di lavoro su cybersicurezza, IA, informatica verde e gli altri ambiti d'azione.",
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
    }),
  ],
  pt: [
    createNewsItem({
      title: 'Publicação do Livro Branco do OEI',
      excerpt:
        'O Observatório publica o seu primeiro livro branco, que estabelece as bases éticas e profissionais da profissão de informática.',
      imageUrl: '/assets/news/livre-blanc.svg',
      path: '/ressources',
    }),
    createNewsItem({
      title: 'Lançamento do site público do OEI',
      excerpt:
        'O site do Observatoire des Experts de l'Informatique entra no ar, apresentando a missão, os domínios de ação e a área de membros.',
      imageUrl: '/assets/news/lancement-site.svg',
      path: '/a-propos',
    }),
    createNewsItem({
      title: 'Chamada de contribuições: junte-se aos nossos grupos de trabalho temáticos',
      excerpt:
        'O OEI convida os profissionais de TI a contribuírem para os grupos de trabalho sobre cibersegurança, IA, TI verde e os demais domínios de ação.',
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/nos-missions',
    }),
  ],
};

const FALLBACK_ARTICLE_IMAGE = '/assets/news/appel-contribution.svg';

// Approved member article submissions (see `article-moderation-mock.adapter.ts`'s
// `getApprovedArticleSubmissions()`) are surfaced through this same `NewsPort.getLatestNews`
// feed rather than a parallel "published articles" list, so `/actualites` (and the home page's
// "Actualités" section, which reuses the exact same port) shows editorial news and approved
// member articles side by side. There is no dedicated article-detail page yet, so `path` points
// back to `/actualites` itself — revisit once one exists.
function approvedSubmissionsAsNewsItems(): NewsItem[] {
  return getApprovedArticleSubmissions().map((submission) =>
    createNewsItem({
      title: submission.title,
      excerpt: submission.body.length > 160 ? `${submission.body.slice(0, 157)}...` : submission.body,
      imageUrl: submission.coverImageUrl ?? FALLBACK_ARTICLE_IMAGE,
      path: '/actualites',
    }),
  );
}

@Service()
export class NewsMockAdapter implements NewsPort {
  getLatestNews(limit: number, lang: string): Observable<NewsItem[]> {
    const news = FIXTURES[lang as SupportedLanguage] ?? FIXTURES['en'];
    // Most-recently-approved articles first, ahead of the static editorial fixtures.
    const combined = [...approvedSubmissionsAsNewsItems().reverse(), ...news];
    return of(combined.slice(0, limit));
  }
}
