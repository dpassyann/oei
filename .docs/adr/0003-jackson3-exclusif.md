# ADR 0003 — Jackson 3 (`tools.jackson.*`) exclusivement, jamais `com.fasterxml.jackson.databind`/`jackson-core`

- Statut : accepté
- Date : 2026-09-04
- Portée : tout le backend Spring Boot (`backend/**`), tous modules Maven confondus.

## Contexte

Spring Boot 4.1 embarque Jackson 3, dont les modules `jackson-core` et `jackson-databind` ont
été renommés sous le groupId/package `tools.jackson.*` (`tools.jackson.core`,
`tools.jackson.databind`). Le bean `ObjectMapper` auto-configuré par Spring est donc de type
`tools.jackson.databind.ObjectMapper` — **pas** `com.fasterxml.jackson.databind.ObjectMapper`.

Plusieurs dépendances tierces (génération OpenAPI, `jackson-databind-nullable`, certaines
libs de l'écosystème Spring non encore migrées) tirent transitivement l'ancien Jackson 2
(`com.fasterxml.jackson.core`/`com.fasterxml.jackson.databind`) sur le classpath. Les deux
coexistent donc physiquement dans le repository Maven local et dans le classpath final. Écrire
du code applicatif contre `com.fasterxml.jackson.databind.ObjectMapper` compile silencieusement
(la classe existe bel et bien sur le classpath, transitivement) mais échoue **au runtime** dès
qu'on essaie d'injecter ce type comme bean Spring, puisque aucun bean de ce type n'est déclaré :

```text
Parameter 1 of constructor in ...StripeWebhookResource required a bean of type
'com.fasterxml.jackson.databind.ObjectMapper' that could not be found.
```

C'est exactement l'incident qui a motivé cet ADR : un webhook Stripe fraîchement écrit
important par erreur `com.fasterxml.jackson.databind.ObjectMapper`/`JsonNode` au lieu de
l'équivalent `tools.jackson.*`, détecté seulement au démarrage de l'application (pas à la
compilation), car `com.fasterxml.jackson.annotation.*` (les annotations, module distinct, non
renommé) et `com.fasterxml.jackson.databind.*` (databind, lui bien renommé) se ressemblent au
point de prêter à confusion à l'écriture comme à la revue.

## Décision

**Tout code applicatif backend (`src/main/java` et `src/test/java`) doit importer
exclusivement `tools.jackson.databind.*` / `tools.jackson.core.*`** pour `ObjectMapper`,
`JsonNode`, `JacksonException` (le remplaçant unifié et non-checked de l'ancien
`JsonProcessingException`), et tout autre type Jackson 3 équivalent.

`com.fasterxml.jackson.databind.*` et `com.fasterxml.jackson.core.*` sont **interdits** dans le
code applicatif, sans exception, y compris dans les tests.

**Seule exception explicite et limitée** : `com.fasterxml.jackson.annotation.*` (annotations
comme `@JsonProperty`, `@JsonIgnore`) reste le bon package — ce module n'a pas été renommé en
Jackson 3 et continue d'exister sous son ancien groupId/package pour compatibilité. Ne pas le
confondre avec `com.fasterxml.jackson.databind.*` (interdit) au moment de l'auto-import de
l'IDE : vérifier systématiquement le package complet, pas seulement le nom de la classe.

### API à connaître pour la migration (différences réelles vs Jackson 2)

- `JsonProcessingException` (checked, hérite de `IOException`) n'existe plus. Utiliser
  `tools.jackson.core.JacksonException` (unchecked, hérite de `RuntimeException`) — un `catch`
  reste syntaxiquement valide même si l'exception n'est plus checked.
- `JsonNode.asText(String defaultValue)` est dépréciée : utiliser
  `JsonNode.asString(String defaultValue)` (même sémantique).
- Le reste de l'API `ObjectMapper`/`JsonNode` (`readTree`, `path`, `get`, `writeValueAsString`,
  etc.) est inchangé nom pour nom.

## Conséquences

- Toute PR/revue de code doit vérifier le package exact de chaque import Jackson —
  `com.fasterxml.jackson.databind`/`com.fasterxml.jackson.core` ne doivent jamais apparaître
  dans un `import` de code applicatif (seul `com.fasterxml.jackson.annotation` est légitime).
- Un futur linter/règle Checkstyle interdisant explicitement
  `com.fasterxml.jackson.databind.**`/`com.fasterxml.jackson.core.**` en import serait une
  amélioration naturelle de cet ADR (non implémenté à la date de rédaction — à faire en tâche
  de suivi si de nouvelles occurrences réapparaissent).
- Les dépendances transitives Jackson 2 restent sur le classpath (utilisées en interne par
  d'autres bibliothèques) — ce n'est pas un problème en soi, tant qu'aucun code applicatif du
  projet ne les importe directement.

## Correctif appliqué à la date de cet ADR

`StripeWebhookResource.java` et `StripeWebhookResourceTest.java`
(`backend/application/web/...`) important par erreur `com.fasterxml.jackson.databind.*` ont été
corrigés vers `tools.jackson.databind.*`/`tools.jackson.core.JacksonException`, avec migration
de `asText(String)` vers `asString(String)`. Vérifié : compilation + tests
(`StripeWebhookResourceTest`, `StripeSignatureVerifierTest`) verts après correctif.
