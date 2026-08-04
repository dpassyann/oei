# Bounded context: `identity`

Compte et authentification du membre : création de compte, email vérifié ou OIDC
(Keycloak), consentements RGPD, langue et pays d'inscription.

Entités attendues (voir `Modèle minimal` du doc 02 et le contrat OpenAPI
`openapi/oei-api.yaml`) : `Member` (identité + `legalName` séparé du nom public),
`VerificationRequest`, `EthicalCharterSignature`.

Ne pas confondre avec `membership` (niveau/statut d'adhésion) ni `profile` (profil
professionnel public).
