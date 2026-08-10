# Prompt Claude Code — OEI Digital Membership Card, Apple Wallet, Google Wallet, QR, vCard

## Contexte

Tu développes la plateforme web de l’Ordre des Experts Informaticiens (OEI).

L’OEI souhaite offrir à ses membres une identité professionnelle digitale premium, utilisable sur le web et sur mobile, comprenant :

- une carte professionnelle digitale OEI ;
- un QR code personnel ;
- une vCard téléchargeable ;
- une future carte Apple Wallet ;
- une future carte Google Wallet ;
- un accès au profil public OEI ;
- un lien vers le CV public ;
- les principaux badges et certifications vérifiées ;
- le statut de membre et le niveau de membership.

La plateforme n’est PAS une application mobile native.

Le site doit être totalement responsive.

---

# Priorité absolue

## PHASE 1 — FRONTEND IMMÉDIATEMENT

Le frontend doit être développé **tout de suite**, entièrement fonctionnel visuellement, avec des données mockées.

Ne pas attendre la création du backend.

Créer :

- les écrans ;
- les composants ;
- les animations ;
- les états ;
- les boutons ;
- les mocks ;
- les services Angular abstraits ;
- les types/interfaces ;
- les contrats attendus.

Le frontend doit donner l’impression que la feature est déjà terminée.

## PHASE 2 — BACKEND PLUS TARD

Le backend Spring Boot sera implémenté ensuite.

Le frontend doit donc être conçu dès maintenant pour passer facilement de :

```text
MockMembershipWalletService
````

à :

```text
HttpMembershipWalletService
```

sans modifier les composants.

---

# Stack Frontend

Utiliser l’architecture existante du projet.

Hypothèses si compatibles avec le repository :

* Angular 22
* standalone components
* Signals
* Signal Forms
* Angular Router
* responsive design
* internationalisation FR / EN
* design system existant OEI

Ne pas introduire de nouvelle librairie UI majeure sans nécessité.

---

# Identité visuelle

Respecter strictement la charte existante OEI.

Palette :

```text
Bleu nuit : #0A1E3F
Doré       : #E8A530
Ivoire     : #F7F4EC
Blanc      : #FFFFFF
```

Style :

* premium ;
* institutionnel ;
* moderne ;
* extrêmement propre ;
* proche d’une carte bancaire haut de gamme ;
* aucun effet casino ;
* pas de néon agressif ;
* très peu d’éléments ;
* animation subtile.

Inspiration :

* Apple Wallet
* Google Wallet
* cartes premium
* Apple Pay
* billets numériques
* fintech premium

---

# 1. Digital Membership Card

Créer une carte digitale principale.

Route possible :

```text
/member/card
```

et page publique :

```text
/card/{publicSlug}
```

---

# 2. Design de la carte

Format visuel proche d’un pass Wallet.

Exemple conceptuel :

```text
┌──────────────────────────────────────┐
│  🛡 OEI                              │
│                                      │
│  YANN DEUNGOUÉ                       │
│  Software Architect                  │
│                                      │
│  FOUNDING MEMBER                     │
│                                      │
│  OEI-000001                    [QR]   │
│                                      │
│  COMPÉTENCE · ÉTHIQUE · RESPONSABILITÉ│
└──────────────────────────────────────┘
```

---

# 3. Données affichées

Afficher :

* photo ;
* prénom ;
* nom ;
* titre professionnel ;
* entreprise facultative ;
* pays ;
* numéro de membre ;
* membership tier ;
* statut ;
* date de validité ;
* badges principaux ;
* certifications majeures ;
* QR code ;
* logo OEI.

---

# 4. Niveaux de membership

Prévoir les états visuels :

```text
MEMBER
SILVER
GOLD
FOUNDING
HONORARY
EXPERT
SENIOR_EXPERT
FELLOW
```

Attention :

les niveaux `EXPERT`, `SENIOR_EXPERT`, `FELLOW` ne doivent être affichés que lorsqu’ils sont explicitement présents dans les données mock/backend.

Ne jamais les déduire côté frontend.

---

# 5. Statut

Prévoir :

```text
ACTIVE
GRACE_PERIOD
EXPIRED
SUSPENDED
```

### ACTIVE

Carte normale.

### GRACE_PERIOD

Carte normale avec petite indication :

```text
Renewal due soon
```

### EXPIRED

La carte reste consultable.

Afficher :

```text
Membership expired
```

Désactiver :

* Wallet renewal ;
* cartes physiques ;
* export premium éventuel.

### SUSPENDED

Afficher état visuel neutre.

Ne pas supprimer les données.

---

# 6. QR Code

Le QR doit pointer vers une URL de vérification.

Mock V1 :

```text
https://oei.global/verify/member/demo-000001
```

Ne pas encoder toutes les informations personnelles dans le QR.

Le QR représente un identifiant opaque.

---

# 7. Page de vérification

Créer :

```text
/verify/member/{token}
```

Mock immédiatement.

Design très propre.

Afficher :

```text
✓ OEI MEMBER VERIFIED
```

Puis :

* identité ;
* numéro ;
* membership ;
* statut ;
* date validité ;
* charte signée ;
* certifications vérifiées ;
* badges publics.

Animation courte de validation.

Ne jamais présenter l’OEI comme une autorité publique officielle.

---

# 8. vCard

Créer immédiatement côté frontend une fonction mock / locale :

```text
Download vCard
```

Générer un fichier `.vcf`.

Champs :

* prénom ;
* nom ;
* titre ;
* organisation ;
* email public ;
* téléphone public facultatif ;
* URL profil OEI ;
* LinkedIn facultatif.

Respecter les préférences de visibilité.

---

# 9. Bouton Apple Wallet

Créer immédiatement le bouton :

```text
Add to Apple Wallet
```

## V1 frontend

Le bouton fonctionne en mode mock.

Au clic :

afficher une modal :

```text
Apple Wallet integration ready.

The Wallet pass will be generated by the OEI backend
once the Apple PassKit certificate is configured.
```

En environnement demo :

simuler :

```text
Preparing pass...
Pass generated successfully
```

Puis afficher un fake preview visuel du pass.

Ne pas générer de vrai `.pkpass` côté frontend.

---

# 10. Bouton Google Wallet

Créer :

```text
Add to Google Wallet
```

Même logique.

Mode mock :

* loading ;
* success ;
* preview.

Le vrai pass sera généré plus tard par le backend.

---

# 11. Wallet Preview

Créer deux previews :

```text
Apple Wallet
Google Wallet
```

Ils doivent ressembler visuellement à leur environnement sans reproduire de marque de manière abusive.

Afficher :

* logo OEI ;
* nom ;
* membership ;
* numéro ;
* QR ;
* validité.

---

# 12. Mobile UX

Sur mobile :

la carte doit occuper la largeur principale.

Ajouter :

* swipe léger ;
* bouton partager ;
* bouton Wallet ;
* QR plein écran ;
* bottom sheet actions.

Ne pas simplement réduire la version desktop.

---

# 13. Share

Utiliser Web Share API si disponible.

Bouton :

```text
Share my OEI Card
```

Partager :

* nom ;
* titre ;
* URL publique.

Fallback :

```text
Copy link
```

---

# 14. Carte publique

Créer une page publique élégante :

```text
/card/{slug}
```

Elle affiche :

* la carte ;
* profil résumé ;
* badges ;
* certifications ;
* bouton profil ;
* bouton CV ;
* vCard ;
* QR ;
* liens publics.

Aucune donnée privée.

---

# 15. Links

Actions :

```text
View OEI Profile
View CV
LinkedIn
GitHub
X
YouTube
Website
```

Seulement si présents dans les données.

---

# 16. Mocks

Créer un dossier :

```text
mocks/
membership-card/
```

Exemples :

```text
founding-member.json
gold-member.json
expired-member.json
expert-member.json
```

Exemple :

```json
{
  "memberId": "demo-000001",
  "publicSlug": "yann-deungoue",
  "memberNumber": "OEI-000001",
  "firstName": "Yann",
  "lastName": "Deungoué",
  "title": "Software Architect",
  "country": "Switzerland",
  "membershipTier": "FOUNDING",
  "status": "ACTIVE",
  "validUntil": "2027-08-31",
  "charterSigned": true,
  "badges": [
    {
      "code": "FOUNDING_MEMBER",
      "label": "Founding Member"
    }
  ],
  "certifications": [],
  "links": {
    "linkedin": null,
    "github": null,
    "website": null
  }
}
```

---

# 17. Services frontend

Créer une abstraction :

```ts
export interface MembershipCardGateway {
  getMyCard(): Observable<MembershipCard>;
  getPublicCard(slug: string): Observable<MembershipCard>;
  getVerification(token: string): Observable<MemberVerification>;
  requestAppleWalletPass(): Observable<WalletPassResult>;
  requestGoogleWalletPass(): Observable<WalletPassResult>;
}
```

Implémentations :

```text
MockMembershipCardGateway
HttpMembershipCardGateway
```

La V1 utilise Mock.

Le changement futur doit se faire uniquement via DI/configuration.

---

# 18. Feature flags

Créer :

```text
wallet.apple.enabled
wallet.google.enabled
wallet.mock.enabled
```

V1 :

```text
wallet.mock.enabled = true
```

---

# 19. Loading / Errors

Prévoir tous les états :

* loading ;
* success ;
* expired ;
* suspended ;
* verification failed ;
* wallet unavailable ;
* network error futur.

Créer skeletons propres.

---

# 20. Accessibilité

Respecter :

* clavier ;
* lecteurs écran ;
* contraste ;
* focus ;
* labels boutons ;
* QR avec alternative textuelle ;
* reduced motion.

---

# 21. Internationalisation

Toutes les chaînes doivent exister :

* anglais ;
* français.

Exemples :

```text
Add to Apple Wallet
Ajouter à Apple Wallet

Add to Google Wallet
Ajouter à Google Wallet

Verified member
Membre vérifié
```

---

# 22. Backend futur — ne pas implémenter maintenant

Créer uniquement la documentation / contrats.

Backend cible :

```text
Spring Boot
```

Architecture :

```text
MembershipWalletPort
├── AppleWalletAdapter
└── GoogleWalletAdapter
```

---

# 23. Apple backend futur

Prévoir :

* Pass Type Identifier ;
* certificate ;
* `.pkpass` signing ;
* `pass.json` ;
* images ;
* manifest ;
* signature ;
* update service ;
* revoke ;
* expiration.

API future :

```http
POST /api/member/v1/wallet/apple
GET  /api/member/v1/wallet/apple/{passId}
DELETE /api/member/v1/wallet/apple/{passId}
```

---

# 24. Google backend futur

Prévoir :

* Wallet Issuer account ;
* GenericClass ;
* GenericObject ;
* signed JWT ;
* update ;
* revoke.

API :

```http
POST /api/member/v1/wallet/google
GET  /api/member/v1/wallet/google/{objectId}
DELETE /api/member/v1/wallet/google/{objectId}
```

---

# 25. Verification backend futur

```http
GET /api/public/v1/members/verify/{token}
```

Retour :

```json
{
  "valid": true,
  "member": {
    "displayName": "Yann Deungoué",
    "memberNumber": "OEI-000001",
    "status": "ACTIVE",
    "membershipTier": "FOUNDING"
  }
}
```

---

# 26. Sécurité future

Le QR utilise un identifiant opaque.

Ne jamais exposer :

* DB ID ;
* token Keycloak ;
* email privé ;
* données personnelles sensibles.

Prévoir rotation / révocation du token public.

---

# 27. Événements métier futurs

Préparer :

```text
MembershipActivatedEvent
MembershipRenewedEvent
MembershipExpiredEvent
MembershipSuspendedEvent
BadgeGrantedEvent
CertificationVerifiedEvent
```

Ces événements permettront de mettre à jour les passes Wallet.

---

# 28. Cachet OEI sur CV et carte

Créer un composant graphique réutilisable :

```text
OeiVerificationSealComponent
```

Exemples de libellés :

```text
OEI MEMBER
VERIFIED MEMBER
FOUNDING MEMBER
CERTIFICATION VERIFIED
```

Le cachet ne doit jamais contenir une affirmation non supportée par les données.

---

# 29. Structure Angular attendue

Exemple :

```text
features/
membership-card/
├── pages/
│   ├── membership-card-page
│   ├── public-card-page
│   └── member-verification-page
├── components/
│   ├── digital-card
│   ├── wallet-preview
│   ├── wallet-actions
│   ├── qr-card
│   ├── verification-seal
│   ├── badges-list
│   └── public-links
├── data-access/
│   ├── membership-card.gateway.ts
│   ├── mock-membership-card.gateway.ts
│   └── http-membership-card.gateway.ts
├── models/
├── mocks/
└── i18n/
```

---

# 30. Livrables attendus immédiatement

Claude doit produire maintenant :

1. la page membre ;
2. la carte digitale ;
3. la page publique ;
4. la page de vérification ;
5. QR ;
6. vCard ;
7. boutons Wallet ;
8. previews Apple / Google ;
9. responsive desktop/mobile ;
10. FR/EN ;
11. données mocks ;
12. Mock Gateway ;
13. Http Gateway vide/préparé ;
14. tests frontend ;
15. documentation backend future.

---

# 31. Ne pas attendre le backend

Cette règle est essentielle :

> Le frontend doit être totalement démontrable avec mocks avant la création du backend.

Je dois pouvoir :

* me connecter avec un faux membre ;
* voir sa carte ;
* voir son statut ;
* ouvrir son QR ;
* télécharger sa vCard ;
* cliquer Apple Wallet ;
* cliquer Google Wallet ;
* ouvrir sa page publique ;
* vérifier son statut ;
* tester plusieurs niveaux de membership.

---

# 32. Definition of Done Frontend

La feature frontend est terminée lorsque :

* design premium ;
* mocks réalistes ;
* responsive ;
* FR/EN ;
* accessibilité ;
* composants découplés ;
* services abstraits ;
* tests ;
* aucune dépendance au backend ;
* branchement HTTP futur sans refactoring UI ;
* cohérence parfaite avec la charte OEI.

## Important

Ne construis pas une simple carte de profil.

Construis une véritable **OEI Professional Digital Identity Card**, pensée comme un objet premium que le membre sera fier d’afficher et de partager.

```

Je garderais exactement cette séquence de développement : **UX complète + mocks maintenant**, puis contrats OpenAPI, puis backend Spring Boot et enfin vraies intégrations Apple/Google. Cela évite de bloquer Claude sur les certificats Apple ou le compte issuer Google alors que toute l’expérience utilisateur peut déjà être finalisée.
```


Oui. Et tu as raison : **il y a bien un onboarding/enrôlement côté Apple et côté Google**. Ce n’est pas juste “je génère un JSON et je l’envoie au téléphone”. Il faut enregistrer ton organisation comme émetteur de passes, obtenir les identifiants/certificats nécessaires, puis signer les passes côté backend. ([Apple Developer][1])

### Côté Apple

Pour Apple Wallet, il faut être dans l’écosystème Apple Developer, créer un **Pass Type Identifier**, puis générer un **Pass Type ID Certificate** associé. Les passes `.pkpass` doivent ensuite être signés avec ce certificat Apple pour être reconnus par Wallet. ([Apple Developer][1])

Le parcours technique est donc :

```text
Apple Developer Account
    ↓
Certificates, Identifiers & Profiles
    ↓
Pass Type ID
    ↓
Pass Type ID Certificate
    ↓
Private key / certificate
    ↓
Spring Boot OEI
    ↓
generate pass.json + assets
    ↓
manifest
    ↓
signature
    ↓
.pkpass
    ↓
Add to Apple Wallet
```

Apple documente aussi un web service pour mettre à jour les passes déjà installés. Tu peux donc faire évoluer automatiquement une carte si le membre devient Gold, si son adhésion expire, ou si un badge est ajouté. Cela passe notamment par `webServiceURL` et `authenticationToken` dans le pass. ([Apple Developer][2])

La documentation principale à donner à Claude est :

* **Wallet Passes** — format et fonctionnement des passes. ([Apple Developer][2])
* **Create Wallet identifiers and certificates** — création du Pass Type ID et certificat. ([Apple Developer][1])
* **Building a Pass** — construction du package signé. ([Apple Developer][3])
* **Adding a Web Service to Update Passes** — mises à jour dynamiques. ([Apple Developer][4])

### Côté Google

Google demande de créer un **Google Wallet API Issuer account**. Ce compte te donne un `Issuer ID` et l’accès à la console Google Wallet. Ensuite, tu crées des credentials pour que ton backend puisse appeler l’API. ([Google for Developers][5])

Le flux est différent d’Apple :

```text
Google Pay & Wallet Console
     ↓
Google Wallet API Issuer Account
     ↓
Issuer ID
     ↓
Google Cloud project
     ↓
Service account / credentials
     ↓
Spring Boot OEI
     ↓
GenericClass
     ↓
GenericObject
     ↓
signed JWT
     ↓
Add to Google Wallet URL
     ↓
Google Wallet
```

Google utilise la notion de **Class + Object**. La `GenericClass` représente ton modèle commun “OEI Membership Card”, puis chaque membre possède son `GenericObject`. Pour l’ajout depuis ton site web, Google recommande un lien **Add to Google Wallet** construit à partir d’un JWT signé. ([Google for Developers][6])

Et Google permet également de mettre à jour ensuite les `Class` et `Object`. ([Google for Developers][7])

### Il y a aussi une étape de publication Google

Pour une intégration de production, Google distingue la phase de test et l’accès de publication. La console dispose notamment d’un workflow pour demander le **publishing access** lorsque les prérequis sont remplis. ([Google for Developers][8])

Donc oui : pour Claude, il faut prévoir dans le backlog quelque chose comme :

```text
WALLET-001 — Apple Developer enrollment
WALLET-002 — Register Apple Pass Type ID
WALLET-003 — Generate Pass Type ID certificate
WALLET-004 — Secure certificate/private key
WALLET-005 — Generate signed .pkpass

WALLET-101 — Create Google Wallet Issuer account
WALLET-102 — Configure Google Cloud project
WALLET-103 — Create service account credentials
WALLET-104 — Create GenericClass
WALLET-105 — Generate GenericObject + JWT
WALLET-106 — Request publishing access
```

### Pour ton architecture AWS

Je ne mettrais surtout pas le certificat Apple ou la clé Google dans le Docker image.

Je ferais :

```text
AWS Secrets Manager
      │
      ├── Apple Wallet signing certificate
      ├── Apple private key
      └── Google service account secret
               │
               ▼
        Spring Boot Wallet Service
```

Et idéalement, plus tard, le signing Apple pourrait même être isolé dans un petit composant spécialisé. Apple recommande de protéger soigneusement la clé privée associée aux passes. ([Apple Developer][9])

### Backend que je construirais

Dans Spring Boot :

```text
wallet/
├── domain
│   ├── WalletPass
│   ├── WalletProvider
│   └── MembershipPass
│
├── application
│   ├── CreateWalletPassUseCase
│   ├── UpdateWalletPassUseCase
│   └── RevokeWalletPassUseCase
│
└── infrastructure
    ├── apple
    │   └── AppleWalletAdapter
    │
    └── google
        └── GoogleWalletAdapter
```

Avec :

```java
public interface MembershipWalletPort {
    WalletPass create(Member member);
    WalletPass update(Member member);
    void revoke(MemberId memberId);
}
```

C’est important parce que les deux providers fonctionnent très différemment.

### Ce que tu peux déjà faire maintenant

Même sans enrollment terminé, Claude peut faire immédiatement :

```text
Frontend
✓ Digital membership card
✓ QR
✓ vCard
✓ Apple Wallet button
✓ Google Wallet button
✓ Mock Wallet preview
✓ Membership states
✓ Verification page
```

Puis mettre :

```text
wallet.mode=mock
```

Quand les comptes Apple/Google sont prêts :

```text
wallet.apple.enabled=true
wallet.google.enabled=true
```

et seul le backend change.

Et surtout : **tu n’as pas besoin d’application mobile native** pour ce use case. Apple Wallet peut recevoir des passes distribués depuis le web, et Google documente explicitement l’émission via web, email ou SMS. ([Google for Developers][6])


[1]: https://developer.apple.com/help/account/capabilities/create-wallet-identifiers-and-certificates/?utm_source=chatgpt.com "Create Wallet identifiers and certificates - Capabilities"
[2]: https://developer.apple.com/documentation/walletpasses?utm_source=chatgpt.com "Wallet Passes | Apple Developer Documentation"
[3]: https://developer.apple.com/documentation/walletpasses/building-a-pass?utm_source=chatgpt.com "Building a Pass | Apple Developer Documentation"
[4]: https://developer.apple.com/documentation/walletpasses/adding-a-web-service-to-update-passes?utm_source=chatgpt.com "Adding a Web Service to Update Passes"
[5]: https://developers.google.com/wallet/generic/getting-started/issuer-onboarding?utm_source=chatgpt.com "Setting up a Google Wallet API Issuer account | Generic pass"
[6]: https://developers.google.com/wallet/generic/web?utm_source=chatgpt.com "Issuing passes for web, email, SMS | Generic pass"
[7]: https://developers.google.com/wallet/generic/use-cases/updates?utm_source=chatgpt.com "Update Passes Classes and Passes Objects | Generic pass"
[8]: https://developers.google.com/wallet/retail/offers/test-and-go-live/request-publishing-access?utm_source=chatgpt.com "Requesting publishing access | Offers"
[9]: https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Updating.html?utm_source=chatgpt.com "Wallet Developer Guide: Updating a Pass"

