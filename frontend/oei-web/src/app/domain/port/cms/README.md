# Bounded context: `cms` (ports)

Ports pour la lecture publique de contenu/documents et pour le back-office
(création, versions, workflow, traductions, médias, livres).

Endpoints OpenAPI correspondants : `GET /api/public/v1/content/{slug}`,
`GET /api/public/v1/documents/{slug}/versions`, tout le préfixe
`/api/admin/v1/content/**`, `/api/admin/v1/media`, `/api/admin/v1/books/**`.
