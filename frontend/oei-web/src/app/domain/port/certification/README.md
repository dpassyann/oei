# Bounded context: `certification` (ports)

Ports pour déclarer et consulter les certifications du membre connecté.

Endpoints OpenAPI correspondants : `GET|POST /api/member/v1/certifications`,
`GET /api/member/v1/certifications/{id}`.

`MemberCertificationGoalPort` suit/enregistre les objectifs de certification du membre
connecté sur le catalogue reconnu (CTA "Voir cette certification"/"Je possède cette
certification"/"Ajouter à mes objectifs"/"En préparation" sur `/certifications`).

Endpoint OpenAPI correspondant : `GET|POST /api/member/v1/certification-goals`.
