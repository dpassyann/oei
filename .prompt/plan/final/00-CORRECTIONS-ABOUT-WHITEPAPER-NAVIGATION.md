# Prompt Claude Code — Correctifs UX À propos / Livre Blanc

## Objectif
Corriger les pages longues `/about` et `/white-paper` sans modifier la charte existante.

## À propos
- rendre le sommaire sticky sous le header ;
- faire fonctionner toutes les ancres ;
- utiliser des IDs stables par section ;
- `scroll-margin-top` pour éviter le recouvrement ;
- synchroniser la section active via `IntersectionObserver` ;
- conserver le hash dans l'URL et supporter un accès direct ;
- navigation clavier ;
- mobile : dropdown/accordéon compact.

## Livre Blanc
Appliquer le même composant de navigation longue page.

Créer un composant réutilisable `LongPageSectionNavigationComponent`.

### CTA
Supprimer le bouton Télécharger placé en haut. Conserver uniquement le formulaire d'envoi situé plus bas.

### Titre dupliqué
Analyser si la répétition « Livre Blanc » vient du hero, breadcrumb, CMS ou contenu dynamique. La supprimer sans casser le rendu dynamique. Si suppression technique risquée, neutraliser visuellement le doublon.

## Tests
- clic sur chaque ancre ;
- accès direct par hash ;
- section active au scroll ;
- mobile ;
- clavier ;
- absence de recouvrement par header ;
- FR/EN.
