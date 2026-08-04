# Bounded context: `cv`

CV Builder : sections manuelles (identité, résumé, expériences, projets,
formations, certifications, compétences, langues, publications, conférences,
engagements, distinctions, références), traductions par section avec statut de
validation humaine, templates et rendu PDF asynchrone.

Entités attendues : `Cv`, `CvSection`, `CvSectionType`, `CvTranslation`
(`MACHINE_GENERATED` → `PENDING_VALIDATION` → `VALIDATED`, jamais publié tant que
non validé), `CvTemplate`, `PdfGenerationJob`.
