# Prompt Claude — Home Page OEI

## Objectif

Développer une page d’accueil publique premium, responsive, dynamique, administrable, internationalisée, accessible et fidèle à l’identité bleu nuit/doré/blanc de l’OEI.

La page doit inspirer confiance à un professionnel du numérique, un DSI, un RSSI, un universitaire, une institution publique, une entreprise partenaire, un média ou un futur membre.

## 1. Header

- logo OEI ;
- nom complet ;
- navigation : Accueil, À propos, Missions, Déontologie, Certifications, Ressources, Actualités, Partenaires, Contact ;
- recherche ;
- langue ;
- bouton Espace membre ;
- menu mobile ;
- header compact au scroll.

## 2. Hero

### Zone gauche

Titre :

> Nous construisons la confiance numérique de demain.

Sous-titre :

> Éthique. Compétence. Responsabilité.

Accroche :

> Pour une informatique au service de l’humain et de la société.

CTA :

- Rejoindre le mouvement
- Lire le Livre Blanc
- Découvrir notre mission

### Zone centrale

Globe numérique avec bouclier OEI. Prévoir image optimisée, animation discrète facultative et respect de `prefers-reduced-motion`.

### Zone droite

Texte :

> Un mouvement international pour structurer, représenter et élever la profession informatique.

Points :

- protéger le public et les professionnels ;
- promouvoir l’excellence et la formation continue ;
- établir un code de déontologie commun ;
- accompagner les transformations numériques de manière responsable.

## 3. Piliers

Quatre cartes administrables :

1. Défendre l’intérêt général
2. Valoriser les compétences
3. Instaurer un cadre déontologique
4. Agir au niveau international

Champs : titre, description, icône, ordre, lien, langue, statut.

## 4. KPI

Afficher via API :

- membres ;
- membres fondateurs ;
- partenaires académiques ;
- partenaires institutionnels ;
- pays représentés ;
- certifications reconnues ;
- publications ;
- groupes de travail.

Si la valeur est nulle, afficher honnêtement « En cours de constitution » ou « Programme en préparation ». Ne jamais fabriquer de chiffres.

## 5. Domaines d’action

Grille configurable :

- cybersécurité ;
- IA ;
- informatique verte ;
- logiciels critiques ;
- formation continue ;
- architecture et qualité ;
- protection des données ;
- éthique et société ;
- cloud et souveraineté ;
- open source ;
- systèmes embarqués ;
- gouvernance numérique.

Chaque domaine : slug, titre, résumé, icône, couleur, illustration, contenu CMS, groupe de travail, visibilité.

## 6. Actualités

Afficher les trois dernières publications :

- article ;
- communiqué ;
- livre blanc ;
- rapport ;
- événement ;
- consultation ;
- appel à contribution.

Champs : titre, résumé, image, date, auteur, catégorie, langue, statut, lien, temps de lecture.

Créer `/publications`.

## 7. Ressources

- Livre Blanc
- Code de déontologie
- Référentiel
- Charte du membre fondateur
- Glossaire
- Rapports
- Statuts
- Manifeste

Source : CMS ou dépôt Markdown.

## 8. Partenaires dynamiques

Créer une section et une page `/partenaires`.

Types :

- académique ;
- entreprise ;
- institution ;
- association ;
- média ;
- soutien.

Champs :

- nom ;
- slug ;
- logo ;
- pays ;
- résumé ;
- site ;
- niveau ;
- début/fin ;
- validation ;
- mise en avant ;
- historique.

Règles :

- aucun logo avant validation ;
- création et upload dans l’admin ;
- publication sur home, listing et page détail ;
- expiration possible ;
- audit complet.

## 9. Citation

> Le numérique est notre bien commun. Les experts informaticiens en sont les gardiens.

Texte administrable.

## 10. Newsletter

- email ;
- langue ;
- centres d’intérêt ;
- consentement ;
- double opt-in ;
- désinscription ;
- journal RGPD.

## 11. Footer

Logo, mission, navigation, documents légaux, réseaux, newsletter, langues, contact et statut légal de l’OEI.

## Modèle minimal

- HomePageConfiguration
- HeroContent
- InstitutionalPillar
- ActionDomain
- KeyMetric
- Publication
- ResourceDocument
- Partner
- PartnerType
- Quote
- NewsletterSubscription
- MediaAsset

## API

```http
GET /api/public/v1/home
GET /api/public/v1/partners
GET /api/public/v1/partners/{slug}
GET /api/public/v1/publications
GET /api/public/v1/resources
POST /api/public/v1/newsletter/subscriptions
```

Admin :

```http
POST /api/admin/v1/partners
PUT /api/admin/v1/partners/{id}
POST /api/admin/v1/partners/{id}/publish
POST /api/admin/v1/media
PUT /api/admin/v1/home/configuration
```

## Livraison

1. Home statique fidèle à la maquette avec mocks.
2. API, PostgreSQL, migrations et cache.
3. Administration partenaires/publications/ressources.
4. CMS, i18n et preview.

## Acceptation

- responsive 320 px à grand écran ;
- WCAG 2.2 AA ;
- SEO ;
- Lighthouse élevé ;
- OpenAPI ;
- tests unitaires, intégration, e2e et visuels ;
- aucun partenaire fictif présenté comme réel.
