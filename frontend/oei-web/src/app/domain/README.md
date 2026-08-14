# `domain/` — organisation par bounded context

Ce dossier applique les principes DDD posés dans `00-CONTEXTE-GLOBAL-OEI.md` : le
domaine ne dépend d'aucun framework, et les règles d'éligibilité, de badge, de
niveau, de visibilité, de certification reconnue et de publication lui
appartiennent.

## Convention (posée par ADR 0002, à respecter par les 3 chantiers suivants)

- `domain/model/<bounded-context>/` : entités et value objects du bounded context
  (types TypeScript purs, sans dépendance Angular/HTTP).
- `domain/port/<bounded-context>/` : interfaces (ports) que
  `infrastructure/adapter/*-mock.adapter.ts` et `*-api.adapter.ts` implémentent, en
  respectant la convention `Observable` de bout en bout décrite dans
  `infrastructure/adapter/README.md` (jamais de `Promise`, jamais de
  `httpResource()` direct dans un port).
- `domain/service/` : reste plat (services de domaine transverses ou spécifiques,
  peu nombreux en V1) — pas de sous-dossier par contexte imposé ici, à introduire
  si un chantier en a réellement besoin.

Un fichier `README.md` dans chaque sous-dossier `model/<contexte>/` et
`port/<contexte>/` documente la responsabilité du bounded context. Ces dossiers
sont volontairement vides de code métier à ce stade : cette fondation ne pose que
la structure, l'implémentation revient aux 3 chantiers fonctionnels (espace membre
individuel, espace membre institutionnel, CMS/gouvernance).

## Bounded contexts créés

| Dossier | Chantier propriétaire | Résumé |
|---|---|---|
| `identity` | Espace membre individuel | Compte, authentification, consentement RGPD |
| `membership` | Espace membre individuel | Adhésion, niveau (`MembershipTier`), charte éthique |
| `profile` | Espace membre individuel | Profil professionnel (expériences, formations, compétences, langues) |
| `cv` | Espace membre individuel | CV Builder (sections, traductions, rendu PDF, templates) |
| `certification` | Espace membre individuel | Déclaration et validation des certifications |
| `badge` | Espace membre individuel | Badges, attribution, historique |
| `wallet` | Espace membre individuel | Carte numérique, Apple/Google Wallet (mocké en V1) |
| `institution` | Espace membre institutionnel | Compte institution, rôles, affiliations, publications, opportunités |
| `cms` | CMS/gouvernance documentaire | Contenu versionné, workflow, traductions, médias |
| `governance` | CMS/gouvernance documentaire | Contributions membres, diff, décisions, synchronisation Git |

Les bounded contexts préexistants du site public (`document`, `domain-area`,
`news-item`, `partner`, `publication`, `newsletter-subscription`, `stat` dans
`model/`, et leurs ports associés) restent à plat à la racine de
`model/`/`port/` : ils ne sont pas rattachés à un chantier fonctionnel des 3
prompts 02/03/04 et ne sont donc pas concernés par cette convention de
sous-dossier.

## Ce qui n'est PAS fait ici (hors périmètre de cette fondation)

Aucun modèle, port, service ou adapter concret n'a été écrit dans ces
sous-dossiers — pas de composants Angular, pas d'adapters mock fonctionnels. Voir
`../../../../../../../.docs/adr/0002-v2-foundations.md` pour le détail des décisions structurantes et le
contrat OpenAPI (`openapi/oei-api.yaml`) pour la forme des données que ces modèles
devront refléter.
