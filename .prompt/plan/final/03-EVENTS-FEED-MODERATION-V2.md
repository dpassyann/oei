# Prompt Claude Code — Événements OEI : feed public, modération et participation

## Vision
Le menu `Événements` est un fil professionnel de type social feed, exclusivement consacré aux événements OEI.

Routes : `/events`, `/events/{slug}`.

## Proposition membre
Un membre connecté peut proposer :
- titre ;
- texte ;
- type ;
- date/heure/timezone ;
- pays ;
- adresse physique OU lien Meetup/visio ;
- image ou PDF en V1.

Future architecture possible pour audio/vidéo, non activée maintenant.

## Publication
Aucune proposition membre n'apparaît directement.

Workflow :
`DRAFT -> SUBMITTED -> AI_PRECHECK -> MODERATOR_REVIEW -> APPROVED -> PUBLISHED`
avec CHANGES_REQUESTED / REJECTED / CANCELLED / ENDED / ARCHIVED.

L'IA assiste la modération : fautes, injures, spam, pertinence, reformulation. Elle ne publie jamais automatiquement en V1.

## Participation
Utilisateur connecté : bouton `Participer`.
Visiteur : bouton grisé ou `Connectez-vous pour participer`.

Après participation :
- registration GOING ;
- email HTML ;
- invitation calendrier `.ics`.

## Commentaires
Uniquement pour les membres ayant participé.
Texte uniquement en V1.
Ouverture à partir de la publication ou `commentsOpenAt`.
Fermeture automatique à `commentsClosedAt` / fin événement.

Les commentaires apparaissent immédiatement puis sont post-modérés.
États : VISIBLE, FLAGGED, HIDDEN, REMOVED.

## Likes
Like simple, idempotent, un par membre.

## Médias
MinIO/S3 via `DocumentStoragePort`, contrôle MIME/taille/antivirus.

## API
`POST /api/member/v1/events/proposals`
`POST /api/member/v1/events/{id}/registrations`
`POST /api/member/v1/events/{id}/comments`
`POST /api/member/v1/events/{id}/like`
`GET /api/admin/v1/events/moderation`
`POST /api/admin/v1/events/{id}/approve`
`POST /api/admin/v1/comments/{id}/hide`
