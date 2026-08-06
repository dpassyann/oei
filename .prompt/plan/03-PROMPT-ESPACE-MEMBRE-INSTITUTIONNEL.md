# Prompt Claude — Espace membre institutionnel OEI

## Objectif

Créer un espace dédié aux entreprises, banques, écoles, universités, associations, administrations, organismes internationaux et partenaires académiques.

Cet espace doit apporter une valeur concrète sans transformer l’OEI en plateforme publicitaire.

## Compte institutionnel

Une institution possède :

- identité légale ;
- nom public ;
- logo ;
- domaines email ;
- pays ;
- secteurs ;
- description ;
- contacts ;
- responsables ;
- niveau de partenariat ;
- vérification ;
- durée ;
- convention ;
- documents ;
- page publique ;
- historique.

## Rôles

- propriétaire ;
- administrateur ;
- RH ;
- responsable technique ;
- communication ;
- lecteur ;
- contributeur ;
- validateur d’affiliation.

## Dashboard

KPI :

- membres affiliés ;
- membres actifs ;
- profils vérifiés ;
- certifications ;
- badges ;
- chartes signées ;
- contributions ;
- formations ;
- opportunités ;
- publications ;
- invitations.

Ne jamais exposer des données sensibles sans base légale.

## Employés membres

Fonctions :

- inviter ;
- accepter/refuser une affiliation ;
- retirer une affiliation ;
- gérer les départs ;
- vérifier par domaine ;
- journaliser.

L’institution ne peut pas modifier le CV personnel. Elle peut confirmer l’affiliation, un rôle, une formation interne ou proposer une reconnaissance acceptée par le membre.

## Avantages collaborateurs

Selon le partenariat :

- niveau Gold ;
- badge institution partenaire ;
- ressources ;
- événements ;
- formations ;
- groupes de travail ;
- visibilité.

## Page publique

- logo ;
- description ;
- engagements ;
- partenariat ;
- actualités ;
- publications ;
- événements ;
- opportunités ;
- membres publics ;
- contributions ;
- programmes reconnus.

Tout contenu est modéré.

## Publications institutionnelles

Types :

- tribune ;
- retour d’expérience ;
- décision DSI ;
- étude ;
- rapport ;
- événement ;
- formation ;
- opportunité.

Workflow :

1. brouillon ;
2. soumission ;
3. contrôles ;
4. revue ;
5. correction ;
6. validation ;
7. traduction ;
8. publication ;
9. archivage.

## Opportunités

- emploi ;
- stage ;
- mentorat ;
- mission pro bono ;
- groupe de travail ;
- appel à experts.

Prévoir modération, durée, transparence, signalement et audit.

## Reconnaissance

L’institution peut proposer :

- formation ;
- contribution ;
- mentorat ;
- publication ;
- distinction interne.

L’OEI reste seul décideur pour un badge OEI officiel.

## Bibliothèque

Accès possible aux référentiels, chartes, rapports, guides, modèles de cahier des charges, recommandations et supports d’audit.

## Groupes de travail

L’institution peut proposer des experts, candidater, commenter, contribuer et suivre les consultations. Les droits de vote dépendent de la gouvernance.

## Sécurité

- multi-tenant ;
- rôles fins ;
- délégations ;
- expiration ;
- audit ;
- vérification de domaine ;
- validation manuelle ;
- isolation stricte.

## Modèle minimal

- Institution
- InstitutionAccount
- InstitutionRole
- InstitutionMembership
- Partnership
- PartnershipLevel
- InstitutionDomain
- MemberInstitutionAffiliation
- InstitutionInvitation
- InstitutionPublication
- InstitutionOpportunity
- InstitutionBadgeProposal
- InstitutionContribution
- InstitutionAuditLog

## API

```http
POST /api/institution/v1/invitations
GET  /api/institution/v1/members
POST /api/institution/v1/affiliations/{id}/approve
POST /api/institution/v1/publications
POST /api/institution/v1/publications/{id}/submit
POST /api/institution/v1/opportunities
GET  /api/institution/v1/dashboard
```

## V1

- création contrôlée ;
- rôles ;
- dashboard ;
- affiliations ;
- page publique ;
- publications et modération ;
- partenariat ;
- niveau Gold validé ;
- opportunités simples ;
- audit.
