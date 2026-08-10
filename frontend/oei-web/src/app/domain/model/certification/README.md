# Bounded context: `certification`

Déclaration de certification (organisme, preuve), vérification contre le
catalogue reconnu, validation automatique ou manuelle, expiration, révocation.

Entités attendues : `Certification`, `CertificationStatus` (`DECLARED` →
`UNDER_REVIEW` → `VALIDATED`/`REJECTED`/`EXPIRED`/`REVOKED`),
`RecognizedCertification` (catalogue, enrichi domaine/niveau/langue/statut OEI/
compétences/validité/parcours associé pour la page publique `/certifications`).

Une certification validée peut déclencher un `BadgeAward` côté `badge`, mais ne le
crée pas elle-même (règle de domaine côté backend).

`MemberCertificationGoal` (`DISCOVER`/`PLANNED`/`PREPARING`/`PASSED`/`OBTAINED`/
`EXPIRED`) suit la progression d'un membre vers une entrée du catalogue reconnu — sans
jamais accorder automatiquement un niveau d'expertise OEI (voir le disclaimer affiché
sur `/certifications`). Distinct de `Certification` : ce dernier reste la déclaration
personnelle du membre soumise à validation, `MemberCertificationGoal` n'est qu'un suivi
d'intention/progrès vis-à-vis du catalogue.
