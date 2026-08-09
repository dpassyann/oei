# Prompt Claude Code — Certifications + Professional Neural Network

## Vision
Mutualiser le modèle métier des pages Certifications et Professional Neural Network tout en conservant deux expériences distinctes.

## `/certifications`
Créer une page avec :
- recherche ;
- filtres domaine, niveau, organisme, langue, statut OEI ;
- cartes certification ;
- organisme officiel ;
- compétences couvertes ;
- expiration éventuelle ;
- CTA `Voir le parcours associé`.

## Graphe
Chaque certification peut devenir un nœud relié par :
`VALIDATES`, `PREREQUISITE_FOR`, `RELATED_TO`, `ISSUED_BY`, `HELD_BY`, `OPENS_PATH_TO`.

Depuis un nœud métier, afficher :
- certifications pertinentes ;
- organismes ;
- membres les possédant ;
- experts de la branche.

CTA membre :
- Voir cette certification
- Je possède cette certification
- Ajouter à mes objectifs
- En préparation

Créer `MemberCertificationGoal` avec états : DISCOVER, PLANNED, PREPARING, PASSED, OBTAINED, EXPIRED.

Une certification ne confère jamais automatiquement le niveau Expert.

## API
`GET /api/public/v1/certifications`
`GET /api/public/v1/certifications/{slug}`
`GET /api/public/v1/network/nodes/{id}/certifications`
`POST /api/member/v1/certification-goals`

## Modèle
`CertificationProgram`, `CertificationProvider`, `RecognizedCertification`, `MemberCertification`, `MemberCertificationGoal`, `CompetencyMapping`, `ProfessionalConcept`.
