# Backlog — tâches notées pour plus tard

*Idées et améliorations identifiées en cours de route, à ne pas implémenter maintenant.*

## Téléchargement du Livre Blanc localisé (backend)

**Contexte** : la page `/livre-blanc` propose aujourd'hui un lien de téléchargement direct vers
un seul fichier PDF statique (`public/assets/livre-blanc/livre-blanc-oei.pdf`, la v3.2 fournie
par l'auteur), quelle que soit la langue affichée sur le site.

**Amélioration prévue** : quand un vrai backend existera, le clic sur "Télécharger le Livre Blanc
complet (PDF)" devrait déclencher l'envoi, depuis le backend, du PDF correspondant à la **langue
courante du site** (`i18n.currentLang()`), plutôt que toujours le même fichier français. Suppose :
- un PDF généré/maintenu par langue une fois les traductions du Livre Blanc disponibles
  (aujourd'hui seul le FR existe dans `content/fr/200-WHITE-PAPERS/`) ;
- un endpoint backend (ex. `GET /api/v1/livre-blanc/{lang}.pdf`) avec repli sur le FR si la
  langue demandée n'a pas encore de PDF traduit, cohérent avec le pattern `isFallback` déjà
  utilisé pour le contenu markdown de cette même page.

Non fait maintenant car : pas de backend réel derrière le frontend actuellement, et pas encore de
traductions du Livre Blanc dans les autres langues.
