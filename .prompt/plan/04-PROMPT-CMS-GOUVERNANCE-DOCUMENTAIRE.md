# Prompt Claude — CMS, Markdown, Git et gouvernance documentaire OEI

## Objectif

Construire dès la V1 un CMS pour gérer pages, publications, livres, Livre Blanc, manifeste, glossaire, statuts, règlement, code de déontologie, référentiels, chartes, rapports, actualités et traductions.

Le CMS coexiste avec un dépôt Git contenant les documents Markdown de référence.

## Sources de vérité

### Documents normatifs

- statuts ;
- règlement ;
- déontologie ;
- référentiels ;
- glossaire ;
- livre blanc ;
- chartes.

Source : Git + Markdown versionné.

### Contenus éditoriaux

- actualités ;
- événements ;
- communiqués ;
- articles ;
- pages marketing.

Source : CMS en base.

## Pipeline Markdown

1. Markdown dans Git ;
2. front matter ;
3. pull request ;
4. contrôles automatiques ;
5. revue éditoriale ;
6. revue de gouvernance ;
7. merge ;
8. webhook/polling ;
9. récupération ;
10. parsing ;
11. rendu HTML ;
12. indexation ;
13. traduction ;
14. publication ;
15. archivage de version.

## Front matter

```yaml
---
id: oei-whitepaper
type: whitepaper
title: "Livre Blanc"
slug: "livre-blanc"
version: "1.0"
status: published
language: fr
sourceLanguage: fr
effectiveDate: 2026-08-01
authors:
  - yann-deungoue
governance:
  approvalRequired: true
  decisionId: DEC-2026-001
translations:
  en: pending
---
```

## Types

- PAGE
- ARTICLE
- NEWS
- EVENT
- WHITEPAPER
- MANIFESTO
- GLOSSARY
- STATUTES
- REGULATION
- ETHICS_CODE
- COMPETENCY_FRAMEWORK
- CHARTER
- REPORT
- BOOK
- PRESS_RELEASE

## Workflow

- DRAFT
- IN_REVIEW
- LEGAL_REVIEW
- GOVERNANCE_REVIEW
- APPROVED
- TRANSLATION_PENDING
- SCHEDULED
- PUBLISHED
- ARCHIVED
- REJECTED

Transitions contrôlées par rôle.

## Gouvernance documentaire

Pour chaque modification structurante :

- proposition ;
- sponsor ;
- justification ;
- version ;
- diff ;
- commentaires ;
- consultation ;
- avis ;
- décision ;
- date d’effet ;
- publication ;
- archivage.

## Contributions membres

Les membres ne modifient pas directement un texte publié. Ils proposent un patch Markdown ou une contribution, commentent, participent à la consultation et suivent le statut.

Afficher version actuelle, proposition, diff, auteurs, commentaires, décision et historique.

## Back-office

- dashboard ;
- éditeur Markdown ;
- preview ;
- médias ;
- métadonnées ;
- programmation ;
- traduction ;
- validation ;
- publication ;
- archivage ;
- rollback ;
- audit.

## Internationalisation

Chaque contenu possède langue source, traductions, état, traducteur, validateur, date et version source. Une traduction devient obsolète si la source change.

## Livres et PDF

Prévoir compilation de documents, table des matières, styles, export PDF, EPUB futur, couverture, métadonnées, version, ISBN facultatif et archivage.

## Recherche

Indexer titre, corps, tags, type, langue, version, auteur, date et statut.

## Sécurité

- sanitization HTML ;
- validation Markdown ;
- scan des pièces ;
- permissions ;
- audit ;
- webhooks signés ;
- prévention des injections.

## Modèle minimal

- Content
- ContentVersion
- ContentTranslation
- ContentApproval
- ContentDecision
- ContentContribution
- ContentComment
- ContentPublication
- DocumentSource
- GitSynchronization
- MediaAsset
- BookCompilation
- PdfGenerationJob

## API

```http
GET  /api/public/v1/content/{slug}
GET  /api/public/v1/documents/{slug}/versions
POST /api/admin/v1/content
PUT  /api/admin/v1/content/{id}
POST /api/admin/v1/content/{id}/submit
POST /api/admin/v1/content/{id}/approve
POST /api/admin/v1/content/{id}/publish
POST /api/admin/v1/git/synchronize
POST /api/member/v1/contributions
```

## V1 obligatoire

- CMS éditorial ;
- Markdown ;
- médias ;
- workflow ;
- rôles ;
- publication ;
- synchronisation Git en lecture ;
- import normatif ;
- versionnement ;
- FR/EN ;
- preview ;
- audit ;
- contributions ;
- diff.

## Acceptation

Aucun document normatif ne peut être écrasé. Rollback, audit, idempotence Git, droits et tests du parser obligatoires.
