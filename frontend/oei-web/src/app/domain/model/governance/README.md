# Bounded context: `governance`

Gouvernance documentaire : contributions membres (patchs Markdown avec diff),
commentaires, décisions de gouvernance, synchronisation en lecture avec le dépôt
Git normatif.

Entités attendues : `ContentContribution`, `ContentComment`, `ContentDecision`,
`DocumentSource`, `GitSynchronization`.

Distinct de `cms` : `cms` porte le contenu et son workflow de publication,
`governance` porte le processus de *proposition/consultation/décision* qui peut
mener à une nouvelle version de contenu, ainsi que la synchronisation avec la
source de vérité Git des documents normatifs.
