# Prompt Claude Code — Actualités dynamiques, recherche globale et Ressources

## Actualités
Aucune actualité hardcodée. Flux :
`Admin -> Backend Java -> PostgreSQL -> OpenAPI -> Frontend`.

API publique :
`GET /api/public/v1/news`
`GET /api/public/v1/news/{slug}`

API admin :
`POST /api/admin/v1/news`
`PUT /api/admin/v1/news/{id}`
`POST /api/admin/v1/news/{id}/publish`

Seuls les admins autorisés publient les actualités officielles.

## Recherche globale
Au clic sur la loupe :
- réduire/cacher le menu ;
- afficher un champ large ;
- autofocus ;
- Escape ferme ;
- debounce ~300 ms.

Recherche V1 uniquement dans :
- ressources ;
- actualités.

Exclure événements, membres, institutions et graphe.

API :
`GET /api/public/v1/search?q=...&types=RESOURCE,NEWS&locale=fr`

Dropdown groupé par type avec navigation vers la ressource ou l'actualité.

Si ce moteur n'est pas prêt pour le go-live, masquer la loupe plutôt que livrer une fausse recherche.

## Ressources : carousel
Créer un carousel de vignettes :
- cover ;
- titre ;
- type ;
- version ;
- langue ;
- taille PDF ;
- CTA email.

Pause automatique au hover/focus et surtout lorsque le champ email reçoit le focus. Reprise après soumission réussie. Respecter `prefers-reduced-motion`.

## Formulaire
Afficher taille du fichier près du formulaire.
Validation email accessible : erreur rouge + message textuel + `aria-describedby`.

API :
`POST /api/public/v1/resources/{id}/email-delivery`

Le backend valide, rate-limit, génère l'email et journalise. Le frontend n'envoie jamais directement un fichier par SMTP.
