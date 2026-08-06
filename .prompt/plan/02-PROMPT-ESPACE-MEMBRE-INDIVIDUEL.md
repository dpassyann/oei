# Prompt Claude — Espace membre individuel OEI

## Objectif

Créer un espace professionnel premium justifiant la cotisation et permettant au membre de construire son identité, valoriser ses compétences, produire un CV, publier un profil, obtenir des badges, partager une carte numérique et participer à l’OEI.

## Inscription et onboarding

- compte, email vérifié ou OIDC ;
- CGU et consentements ;
- langue et pays ;
- identité ;
- photo ;
- titre ;
- résumé ;
- expertises ;
- expériences ;
- formations ;
- certifications ;
- langues ;
- visibilité ;
- charte ;
- adhésion.

Sauvegarde automatique et reprise ultérieure.

## Profil professionnel

- nom public et identité légale séparés ;
- titre ;
- résumé ;
- localisation ;
- disponibilité ;
- expertises ;
- technologies ;
- secteurs ;
- langues ;
- expériences ;
- formations ;
- publications ;
- conférences ;
- certifications ;
- badges ;
- projets ;
- open source ;
- liens ;
- adhésion ;
- score de complétude.

## CV Builder

Sections manuelles :

- identité ;
- résumé ;
- expériences ;
- projets ;
- formations ;
- certifications ;
- compétences ;
- langues ;
- publications ;
- conférences ;
- engagements ;
- distinctions ;
- références.

Import futur PDF/DOCX avec extraction assistée et validation manuelle. Aucun contenu extrait n’est publié automatiquement.

### Multilingue

Chaque section possède langue source, traductions, statut et validation humaine. Une traduction automatique reste signalée tant qu’elle n’est pas validée.

### PDF

Rendu HTML/CSS vers PDF :

- A4 ;
- polices intégrées ;
- liens ;
- pagination ;
- QR vers profil ;
- badges sélectionnables ;
- langue ;
- deux templates premium en V1.

### Profil public

URL :

```text
https://oei.example/members/{publicSlug}
```

Fonctions :

- visibilité par champ ;
- URL personnalisée ;
- SEO ;
- partage ;
- QR ;
- PDF ;
- contact relayé ;
- statistiques respectueuses de la vie privée.

## Badges

### Badges initiaux

- membre ;
- membre fondateur ;
- charte signée ;
- profil vérifié ;
- identité vérifiée ;
- contributeur ;
- mentor ;
- auteur ;
- relecteur ;
- membre actif.

### Certifications

Workflow :

1. déclaration ;
2. organisme et preuve ;
3. vérification du catalogue reconnu ;
4. validation automatique ou manuelle ;
5. attribution ;
6. expiration éventuelle ;
7. révocation possible.

Chaque badge conserve source, règle, validateur, dates et historique.

## Carte professionnelle numérique

- identité ;
- photo ;
- titre ;
- organisation ;
- numéro de membre ;
- badges ;
- QR ;
- profil ;
- vCard ;
- contact.

Fonctions :

- Web Share API ;
- téléchargement vCard ;
- QR ;
- plein écran ;
- PWA légère ;
- partage NFC via tag externe.

## Apple Wallet / Google Wallet

Préparer l’architecture pour Apple Wallet Pass et Google Wallet Generic Pass :

- nom ;
- photo facultative ;
- numéro ;
- statut ;
- validité ;
- QR signé ;
- couleurs de niveau ;
- lien de vérification ;
- badges.

Ne jamais présenter le pass comme une pièce d’identité officielle. Prévoir signature serveur, révocation et renouvellement.

## Niveaux

- Standard
- Silver
- Gold
- Founding
- Honorary
- Institutional Affiliate

### Gold via employeur partenaire

Le rattachement doit être prouvé par domaine email vérifié ou validation institutionnelle. Un email seul ne suffit pas.

## Employabilité

Prévoir :

- disponibilité ;
- recherche de mission/emploi ;
- visibilité recruteur ;
- annuaire ;
- compétences vérifiées ;
- opportunités institutionnelles ;
- recommandation de formations.

Ne pas faire un job board généraliste en V1.

## Gamification responsable

Récompenser apprentissage, contribution, éthique, transmission et qualité. Interdire pay-to-win, scores opaques et classements humiliants.

## Confidentialité

- visibilité par champ ;
- export RGPD ;
- suppression ;
- audit ;
- chiffrement ;
- scan antivirus ;
- séparation identité vérifiée/profil public.

## Modèle minimal

- Member
- Membership
- MembershipTier
- ProfessionalProfile
- Experience
- Education
- Skill
- Certification
- RecognizedCertification
- Badge
- BadgeAward
- EthicalCharterSignature
- Cv
- CvSection
- CvTranslation
- CvTemplate
- PublicProfile
- DigitalBusinessCard
- WalletPass
- EmploymentAffiliation
- VerificationRequest

## API

```http
POST /api/public/v1/accounts
GET  /api/member/v1/profile
PUT  /api/member/v1/profile
POST /api/member/v1/cv
POST /api/member/v1/cv/{id}/render
POST /api/member/v1/certifications
GET  /api/member/v1/badges
POST /api/member/v1/public-profile/publish
POST /api/member/v1/digital-card
```

## V1 obligatoire

- inscription ;
- onboarding ;
- profil ;
- CV builder ;
- PDF ;
- profil public ;
- badges de base ;
- certifications avec validation ;
- carte web ;
- QR ;
- CMS d’aide.

Wallet activable après disponibilité des comptes et certificats éditeur.
