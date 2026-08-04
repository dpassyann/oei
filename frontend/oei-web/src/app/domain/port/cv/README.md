# Bounded context: `cv` (ports)

Ports CRUD sur les CV/sections/traductions et déclenchement du rendu PDF
(asynchrone : le port retourne le `PdfGenerationJob`, pas le PDF directement).

Endpoints OpenAPI correspondants : `GET|POST /api/member/v1/cv`,
`GET|PUT /api/member/v1/cv/{id}`, `POST /api/member/v1/cv/{id}/sections`,
`POST .../translations`, `POST /api/member/v1/cv/{id}/render`.
