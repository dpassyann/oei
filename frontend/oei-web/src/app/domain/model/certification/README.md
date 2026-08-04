# Bounded context: `certification`

Déclaration de certification (organisme, preuve), vérification contre le
catalogue reconnu, validation automatique ou manuelle, expiration, révocation.

Entités attendues : `Certification`, `CertificationStatus` (`DECLARED` →
`UNDER_REVIEW` → `VALIDATED`/`REJECTED`/`EXPIRED`/`REVOKED`),
`RecognizedCertification` (catalogue).

Une certification validée peut déclencher un `BadgeAward` côté `badge`, mais ne le
crée pas elle-même (règle de domaine côté backend).
