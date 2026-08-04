# Bounded context: `cms`

Contenu éditorial et normatif versionné : types (`PAGE`, `ARTICLE`, `NEWS`,
`EVENT`, `WHITEPAPER`, `MANIFESTO`, `GLOSSARY`, `STATUTES`, `REGULATION`,
`ETHICS_CODE`, `COMPETENCY_FRAMEWORK`, `CHARTER`, `REPORT`, `BOOK`,
`PRESS_RELEASE`), workflow (`DRAFT` → ... → `PUBLISHED` → `ARCHIVED`), traductions,
médiathèque, compilation de livres.

Entités attendues (voir modèle minimal du doc 04) : `Content`, `ContentVersion`,
`ContentTranslation`, `ContentApproval`, `ContentPublication`, `MediaAsset`,
`BookCompilation`, `PdfGenerationJob`.

Aucun document normatif ne peut être écrasé : toute modification crée une
nouvelle `ContentVersion` (jamais de mutation en place d'une version publiée).
