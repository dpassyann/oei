# OEI — Roadmap corrective et évolutive avant go-live

## P0 Correctifs
- navigation sticky À propos ;
- ancres À propos ;
- navigation sticky Livre Blanc ;
- ancres Livre Blanc ;
- suppression bouton download haut ;
- suppression/neutralisation doublon Livre Blanc ;
- actualités dynamiques backend/OpenAPI.

## P1 Ressources / Recherche
- recherche globale resources + news ;
- dropdown ;
- carousel ressources ;
- pause au focus ;
- taille PDF ;
- validation email ;
- envoi via backend.

## P1 Pages métier
- compléter Déontologie ;
- compléter Certifications ;
- relier Certifications et Neural Network.

## P1 Events
- menu événements ;
- feed ;
- proposition membre ;
- pré-modération événement ;
- participation ;
- commentaires participants ;
- fermeture commentaires ;
- likes ;
- archives.

## P1 Emails
- Thymeleaf ;
- FR/EN ;
- ressources ;
- membership ;
- articles ;
- institutions ;
- events ;
- badges ;
- commandes.

## P1 Admin
- inbox modération ;
- assistance IA ;
- audit.

## Ordre recommandé
1. Correctifs pages longues.
2. Contrats OpenAPI news/resources.
3. Infrastructure email Thymeleaf.
4. Resources carousel + email.
5. Admin moderation.
6. Events backend.
7. Events frontend.
8. Certifications + graph.
9. Recherche globale.
10. QA/security/go-live.

## Scope freeze
Après ce package, aucune nouvelle feature structurante avant mise en ligne, sauf sécurité, conformité ou bug bloquant.

## Definition of Done
Responsive, FR/EN, accessibilité, OpenAPI, migrations PostgreSQL, permissions backend, tests, audit, sécurité et observabilité.
