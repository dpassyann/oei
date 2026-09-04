# ADR 0004 — Développer sur des branches dédiées, merger sur `main` quand c'est stable

- Statut : accepté
- Date : 2026-09-04
- Portée : tout le repository, tous contributeurs (humain et agents IA).

## Contexte

Plusieurs chantiers avancent en parallèle sur ce dépôt (l'utilisateur, l'assistant IA, parfois
plusieurs agents sur des sous-tâches distinctes). Sans convention explicite, le risque est de
développer directement sur `main`, rendant l'historique difficile à suivre, augmentant le
risque de régressions non isolées, et compliquant le retour en arrière sur un chantier précis
sans affecter les autres.

## Décision

- **Chaque plan/chantier de développement se fait sur une branche locale dédiée**
  (ex. `feature/member-space-integration`, `feature/paypal-webhook`), jamais directement sur
  `main` une fois qu'un vrai développement démarre (exploration ponctuelle/hotfix trivial
  exceptés, à l'appréciation du contributeur).
- **Merge dans `main` autorisé dès qu'un ensemble cohérent de tâches est stable** (build vert,
  tests verts pour le périmètre concerné) — pas besoin d'attendre la fin complète d'un plan
  entier avant de merger, pour éviter d'accumuler de longues branches divergentes.
- **`git push` reste entièrement sous le contrôle de l'opérateur humain.** Merger localement
  dans `main` ne déclenche et n'autorise aucun push automatique — le push (et donc le
  déclenchement effectif d'un déploiement CI/CD) est une décision humaine explicite, prise
  séparément, à chaque fois.
- Convention de nommage de branche : `feature/<nom-court-du-chantier>` (kebab-case), reflétant
  le chantier plutôt qu'un numéro de ticket arbitraire.

## Conséquences

- `main` reflète l'avancement réel régulièrement plutôt que d'être en avance ou en retard de
  plusieurs chantiers non intégrés.
- Un chantier instable ou abandonné reste isolé sur sa branche et n'affecte jamais `main`.
- Avant tout merge, vérifier au minimum : compilation propre (`mvn compile`/`tsc --noEmit`) et
  tests du périmètre touché — un merge n'est pas une formalité, c'est un point de contrôle de
  qualité.
- Le remote (`origin`) ne reçoit jamais de changement sans une action `git push` explicitement
  décidée et exécutée par l'opérateur humain, jamais par un agent IA de façon autonome.
