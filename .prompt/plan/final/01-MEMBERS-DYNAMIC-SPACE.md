# Feature — Espace membre dynamique OEI

## Objectif
Le profil reste accessible même si la cotisation n'est plus active. Les services premium sont suspendus automatiquement.

## États
`PENDING`, `ACTIVE`, `GRACE_PERIOD`, `EXPIRED`, `SUSPENDED`, `HONORARY`, `FOUNDING`.

## Entitlements
Créer `MembershipEntitlementService` et des droits backend :
`PROFILE_EDIT`, `PROFILE_PUBLIC`, `CV_EDIT`, `CV_EXPORT_PDF`, `BUSINESS_CARD_EXPORT`, `BUSINESS_CARD_ORDER`, `ARTICLE_SUBMIT`, `EVENT_POST`, `MEMBER_DIRECTORY`, `WALLET_PASS`, `CERTIFICATION_BADGE`.

### ACTIVE
Tous les droits du niveau.

### EXPIRED
Autoriser login, profil, modification profil/CV, lecture publique. Bloquer export CV, commande cartes, soumission article, renouvellement Wallet et avantages premium.

## CV OEI
Builder, templates premium, FR/EN, QR profil, badges vérifiés, certifications, signature visuelle OEI.

Ne pas parler d'« accréditation officielle » tant que l'OEI ne possède pas ce statut. Préférer « Membre OEI », « Profil membre OEI vérifié », « Certifications vérifiées par l'OEI ».

## Export PDF
Ajouter documentId, date, QR de vérification et niveau membre au moment de génération.

## Automatisation
PSP webhook -> membership status -> entitlement recalculation. Pas d'admin nominal.

## API
```http
GET /api/member/v1/me
GET /api/member/v1/entitlements
GET /api/member/v1/cv
PUT /api/member/v1/cv
POST /api/member/v1/cv/export
```
