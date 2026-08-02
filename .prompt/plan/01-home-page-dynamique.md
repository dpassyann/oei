# Prompt de développement — Home page dynamique et configurable

*Document destiné à être transmis à un agent de développement (Claude Code ou équivalent) pour planifier et implémenter la version enrichie de la page d'accueil du site OEI.*

## 1. Contexte

Le site OEI (`frontend/oei-web`, Angular 22, architecture DDD avec bascule mock/API) a aujourd'hui une page d'accueil minimale (héros + CTA), très en retrait par rapport à la maquette validée `.prompt/maquetteUI.png`. Cette dernière montre une home page riche, structurée en plusieurs sections denses. L'objectif de ce chantier est de faire correspondre la home page réelle à cette maquette, tout en la rendant **dynamique et configurable** plutôt que du contenu figé dans le HTML — en réutilisant le pattern DDD déjà en place (`domain/port` → `application/service` → `infrastructure/adapter` mock + API, bascule via `RuntimeConfig`).

## 2. Sections attendues (fidèles à la maquette)

1. **En-tête** (déjà fait) : logo, navigation complète, sélecteur de langue, bouton Espace membre.
2. **Héros** (déjà fait, à enrichir) : titre, sous-titre, accroche, CTA « Rejoignez le mouvement », illustration bouclier/globe. Un encart latéral avec une liste de points forts (« Protéger le public et les professionnels », « Promouvoir l'excellence... », etc.) — actuellement absent, à ajouter.
3. **Bandeau de statistiques** : 4 chiffres clés (Membres fondateurs, Partenaires académiques, Pays concernés, Certifications en développement). **Ces chiffres doivent être réels, jamais fabriqués** (cf. la page Membres fondateurs déjà construite qui affiche un état honnête plutôt qu'un nombre inventé) — tant qu'il n'y a pas de données réelles, chaque compteur affiche `0+` avec un intitulé honnête, pas un chiffre plausible inventé.
4. **Grille « Nos domaines d'action »** : 8 cartes (Cybersécurité, Intelligence Artificielle, Informatique Verte, Logiciels Critiques, Formation Continue, Architecture & Qualité, Protection des Données, Éthique & Société) avec icône, titre, description courte.
5. **Bandeau « Défendre l'intérêt général / Valoriser les compétences / Instaurer un cadre déontologique / Agir au niveau international »** : 4 blocs avec icône + titre + description.
6. **Actualités** : liste des 2-3 dernières actualités (image, titre, extrait, lien "Lire la suite"). Tant qu'il n'y a pas de vraies actualités publiées, afficher un état honnête (cf. la page Actualités déjà construite : « Aucune actualité n'a été publiée pour le moment ») plutôt que du contenu inventé.
7. **Nos ressources** : liste de liens vers les ressources (déjà construite comme page dédiée `/ressources` — la home page doit en afficher un extrait/résumé avec lien "Voir toutes les ressources").
8. **Partenaires** (« Ils nous soutiennent ») — **nouvelle fonctionnalité, détaillée en section 3**.
9. **Citation + newsletter + réseaux sociaux** (déjà fait dans le footer).

## 3. Nouvelle fonctionnalité : gestion des partenaires

Le mockup affiche une rangée de logos partenaires (IEEE, ACM, Inria, EPFL, UNESCO). Ces partenariats n'existent pas encore réellement — il faut donc construire la **fonctionnalité complète de gestion des partenaires**, pas juste afficher des logos en dur :

- **Domaine** : une entité `Partner` (nom, logo, description courte, lien site web, catégorie — ex. « Institution académique », « Organisme professionnel », « Entreprise partenaire »).
- **Espace de création** : un espace d'administration (à protéger par un rôle `admin` Keycloak, cohérent avec l'architecture d'authentification déjà en place) permettant de créer/éditer/supprimer un partenaire : nom, upload de logo, description, lien.
- **Affichage** : 
  - Un extrait (logos) sur la home page, dans la section « Ils nous soutiennent ».
  - Une page dédiée `/partenaires` listant tous les partenaires avec plus de détails (logo, nom, description, lien, catégorie).
- **Architecture** : suivre exactement le pattern DDD déjà établi (`domain/port/partner-repository.port.ts`, `application/service/partner-application.service.ts`, `infrastructure/adapter/partner-mock.adapter.ts` + `partner-api.adapter.ts`, bascule via `RuntimeConfig`). En mode mock (v1), quelques partenaires factices clairement identifiés comme démonstration ; en mode API, appel au backend une fois celui-ci construit.

## 4. Dynamisme et configurabilité

Toutes les sections listées en §2 (hors en-tête/pied de page déjà faits) doivent être pilotées par des données structurées (DTO/port), pas du texte codé en dur dans le template — même en mode mock, les données doivent transiter par le même pipeline domaine → application → infrastructure que le reste de l'app, pour que brancher un vrai backend plus tard ne nécessite aucun changement de la couche présentation. Concrètement :

- `HomeContentApplicationService` (ou extension de l'existant `ContentApplicationService`) orchestrant plusieurs ports : `StatsPort` (chiffres clés), `DomainsPort` (grille des domaines d'action), `NewsPort` (actualités), `PartnerRepositoryPort` (partenaires).
- Chaque section a son adapter mock (données de démonstration honnêtes, clairement temporaires) et son adapter API (appel HTTP, contrat OpenAPI à définir en même temps que le backend).
- i18n : toutes les données affichées doivent passer par le système de traduction — voir le prompt séparé sur l'internationalisation complète si un tel document existe, sinon s'assurer qu'aucune chaîne de section n'est codée en dur uniquement en français.

## 5. Phasage recommandé

1. Construire la home page enrichie en **mode mock d'abord** (toutes les sections avec données de démonstration honnêtes), pour livrer rapidement une home page visuellement complète et fidèle à la maquette.
2. Construire la fonctionnalité Partenaires (domaine + espace de création + pages) en mode mock également.
3. Une fois le backend (Spring Boot, cf. plan d'infra et de design existants) disponible, brancher les adapters API un par un, sans toucher à la couche présentation.

## 6. Points d'attention

- Ne jamais afficher de chiffre ou de contenu fabriqué (actualités inventées, nombre de membres inventé, partenaires fictifs présentés comme réels) — toujours un état honnête tant que la donnée réelle n'existe pas.
- Respecter la palette (`#0a1e3f` / `#e8a530`) et la structure DDD déjà en place.
- Le site doit rester entièrement responsive (le rendu mobile actuel est déjà correct grâce au flexbox existant — à vérifier après chaque nouvelle section).
