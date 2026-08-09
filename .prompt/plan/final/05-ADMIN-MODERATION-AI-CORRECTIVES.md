# Prompt Claude Code — Console Admin : modération et assistance IA

## `/admin/moderation`
Tabs :
- Articles
- Événements
- Signalements
- Commentaires flaggés

Afficher auteur, type, date, langue, extrait, statut et résultat de pré-analyse IA.

## Workflow contenu
`SUBMITTED -> AI_PRECHECK -> IN_REVIEW -> CHANGES_REQUESTED -> APPROVED -> SCHEDULED -> PUBLISHED`
avec REJECTED / ARCHIVED.

## ContentModerationPort
Retour structuré :
- language ;
- toxicityRisk ;
- insultRisk ;
- spamRisk ;
- formattingIssues ;
- spellingSuggestions ;
- relevanceRisk ;
- suggestedRewrite ;
- confidence.

Règle absolue : **l'IA assiste, l'admin décide.**

## Actions
approve, reject, request changes, preview, schedule, unpublish, archive, hide/restore comment.

Raison obligatoire pour rejet ou suppression sensible.

## Permissions
CONTENT_ADMIN, EVENT_ADMIN, MODERATOR, SUPER_ADMIN, AUDITOR_READONLY.

## Audit
Conserver before/after, raison, modérateur, résultat IA éventuel, timestamp et correlationId.
