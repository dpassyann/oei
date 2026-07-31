# Design — Plateforme technique OEI (site public + espace membre)

*Ordre des Experts Informaticiens — 2026-07-31*

## Contexte

L'OEI avance en parallèle sur trois chantiers indépendants :
1. **Documentaire** — écriture du corpus (glossaire, livre blanc, code de déontologie…), encore largement à faire malgré une première ébauche existante dans `.prompt/`.
2. **Administratif** — création de l'association suisse (statuts, marque, protection intellectuelle) — traité en dehors de ce document, en mode conseil.
3. **Technique** — objet de ce design : site public + espace membre, pensé pour absorber un corpus documentaire qui s'écrit progressivement, pas un corpus figé.

Une maquette validée existe pour la page d'accueil (`.prompt/maquetteUI.png`) : header avec navigation complète, sélecteur de langue (dropdown + toggle footer), CTA « Espace membre » et « Rejoignez le mouvement », hero avec globe/bouclier, bandeau de statistiques, grille « domaines d'action », actualités, ressources, logos partenaires, newsletter, réseaux sociaux. La v1 doit lui être **visuellement identique**.

## Objectifs de la v1

- Site public multilingue (FR, EN, DE, ES, IT, PT dès le lancement) fidèle à la maquette pour la page d'accueil.
- Pages secondaires (À propos, Nos missions, Déontologie, Certifications, Ressources, Actualités, Contact) avec leurs propres maquettes, à concevoir avant codage.
- Espace membre : création de compte, login via Keycloak, formulaire d'adhésion (type de membre + motivation), consultable par un rôle admin.
- Contenu documentaire versionné en Markdown, organisé par langue, avec repli automatique vers l'anglais si une traduction manque.
- Hébergement Docker sur une seule instance AWS EC2, sécurité de base non négociable dès le lancement.

## 1. Structure du monorepo

```
oei-platform/
├── frontend/          Angular (site public + espace membre)
├── backend/           Spring Boot (API + intégration Keycloak)
├── content/           Corpus documentaire versionné, par langue
│   ├── fr/  en/  de/  es/  it/  pt/
├── keycloak/          Realm export, thème de login personnalisé
├── infra/             docker-compose.yml, config Traefik/Caddy, scripts de déploiement
└── docs/              Specs, plans
```

Un seul dépôt git, un seul historique entre code et contenu.

## 2. Frontend Angular — internationalisation

- `@angular/localize` (natif Angular) pour l'interface — pas de dépendance tierce (ngx-translate) pour un besoin de traduction statique.
- Un fichier de traduction par langue pour les chaînes d'interface (nav, boutons, footer), 6 langues actives dès la v1.
- Le contenu documentaire (livre blanc, glossaire, ressources) est chargé séparément depuis `content/<lang>/...` via l'API backend — pas compilé dans le bundle Angular, pour publier une mise à jour de contenu sans recompiler ni redéployer le frontend.
- Sélecteur de langue (dropdown header + toggle footer, fidèle à la maquette) bascule la locale Angular ET la langue de contenu demandée au backend.
- Repli automatique vers l'anglais si un document n'existe pas dans la langue choisie, avec bandeau « traduction à venir ».
- Page d'accueil : identique à la maquette. Pages secondaires : maquettes à concevoir dans un second temps (après validation de la home), pour ne pas bloquer le début du développement.

## 3. Backend Spring Security + Keycloak

- Spring Boot expose une API : lecture du contenu (`content/`), gestion du formulaire d'adhésion, endpoints protégés pour l'espace membre.
- Keycloak gère entièrement l'authentification (OIDC), avec un thème de login personnalisé reprenant l'identité visuelle (bleu nuit/doré, logo bouclier).
- Spring Security agit en resource server OIDC (validation de tokens Keycloak) — pas de gestion de mot de passe côté application.
- Formulaire d'adhésion : accessible après login, écrit en base (type de membre demandé + motivation), consultable par un rôle `admin` (mappé depuis un rôle Keycloak) pour validation manuelle — reflète l'art. 6 des statuts (admission prononcée par le conseil d'administration).

## 4. Contenu documentaire

- Markdown versionné dans `content/`, organisé par langue, un fichier par document, métadonnées en front-matter (titre, date, statut de traduction).
- Choix motivé : moins de surface d'attaque qu'un CMS headless pour une v1 lancée vite, traçabilité git adaptée à des documents à portée quasi-juridique (statuts, code de déontologie), cohérent avec le workflow existant.
- Structure pensée pour migrer vers un CMS headless plus tard, quand des contributeurs non-techniques (premier cercle académique/juridique) devront publier sans passer par git.

## 5. Infrastructure Docker/AWS et sécurité

- Une instance EC2, `docker-compose` avec : `frontend` (nginx statique), `backend` (Spring Boot), `keycloak`, `postgres` (Keycloak + adhésions), `traefik` (reverse proxy, HTTPS automatique via Let's Encrypt).
- Sécurité de base non négociable : HTTPS partout, secrets hors git (`.env`), Security Group AWS limité à 80/443/22 (22 restreint), mises à jour régulières des images, sauvegardes de la base Postgres.
- Pas de WAF/CDN en v1 — à réévaluer selon le trafic réel.

## Hors périmètre de ce document

- Écriture du corpus documentaire (chantier éditorial séparé).
- Création de l'association suisse et dépôt de marque (traité en mode conseil, hors design logiciel).
- Migration éventuelle vers un CMS headless (v2+).
- Maquettes détaillées des pages secondaires (à produire avant leur implémentation, en aval de ce document).