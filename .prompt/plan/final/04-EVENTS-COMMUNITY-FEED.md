# Feature — Événements OEI et fil communautaire

## Vision
Créer un menu **Événements** avec agenda, inscriptions, invitations, page événement, feed live, photos, commentaires, réactions et archives.

Routes :
`/events`, `/events/{slug}`.

## Event model
Titre, slug, type, description, image, pays, ville, lieu, onlineUrl, début, fin, timezone, capacité, visibilité, organisateurs, langues, statut.

Types : meetup, colloque, conférence, webinar, workshop, assemblée, cérémonie, networking.

États :
`DRAFT`, `PUBLISHED`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `LIVE`, `ENDED`, `ARCHIVED`, `CANCELLED`.

## Inscription
CTA `Participer` -> confirmation -> email HTML -> fichier `.ics` -> rappels.

## Page événement
Hero, sujet, programme, speakers, lieu, horaires, organisateurs, CTA participation, participants publics optionnels.

## Feed LIVE
Pendant la fenêtre autorisée :
- texte court ;
- photo ;
- réactions ;
- commentaires ;
- signalement.

Pas de messagerie privée en V1.

## Consentement
Avant première publication photo, recueillir un consentement explicite. Distinguer le consentement à publier son contenu du droit à l'image des tiers. L'inscription à l'événement ne vaut pas consentement général à la publication de son image.

## Après l'événement
Feed en lecture seule, nouvelles publications fermées, galerie et historique conservés.

## Page /events
1. prochain événement ;
2. événements ouverts ;
3. historique avec pays, date, photos, résumé, speakers.

## Modération
Signalement, masquage, suppression logique, suspension auteur, audit, antivirus et limites de taille.

## API
```http
GET /api/public/v1/events
GET /api/public/v1/events/{slug}
POST /api/member/v1/events/{id}/registrations
GET /api/member/v1/events/{id}/feed
POST /api/member/v1/events/{id}/posts
POST /api/member/v1/event-posts/{id}/comments
POST /api/member/v1/event-posts/{id}/reactions
POST /api/admin/v1/events
PUT /api/admin/v1/events/{id}
POST /api/admin/v1/events/{id}/publish
POST /api/admin/v1/events/{id}/start
POST /api/admin/v1/events/{id}/end
```

V1 temps réel : polling léger ou SSE. Ne pas introduire WebSocket sans besoin réel.
