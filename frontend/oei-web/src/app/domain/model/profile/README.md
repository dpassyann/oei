# Bounded context: `profile`

Profil professionnel : titre, résumé, localisation, disponibilité, expertises,
technologies, secteurs, langues, expériences, formations, compétences, score de
complétude — et sa projection publique (`PublicProfile`).

Entités attendues : `ProfessionalProfile`, `Experience`, `Education`, `Skill`,
`LanguageProficiency`, `PublicProfile`, `DigitalBusinessCard`.

Ne porte pas le CV (voir `cv`) ni les certifications (voir `certification`), même
si le rendu final les agrège.
