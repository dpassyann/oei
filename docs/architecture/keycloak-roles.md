# Modèle de rôles Keycloak — realm `oei`

Ce document décrit le modèle de rôles posé en fondation (voir ADR
[`0002-v2-foundations.md`](../adr/0002-v2-foundations.md)) pour les trois chantiers
fonctionnels à venir : espace membre individuel, espace membre institutionnel et
CMS/gouvernance documentaire. Il complète
`keycloak/realm-export/oei-realm.json`, qui est la source de vérité déclarative
(appliquée manuellement au conteneur Keycloak local via `kcadm.sh` pendant cette
fondation — voir §"Comment ça a été vérifié").

## Principe général

Deux familles de rôles realm coexistent :

- **Rôles de base**, déjà présents avant cette fondation : `member`, `admin`.
- **Rôles de niveau membre** (`member-*`) : composites, ils impliquent toujours
  `member`. Un utilisateur porte exactement un rôle `member-*` à la fois (le niveau
  d'adhésion), plus éventuellement des rôles fonctionnels transverses.
- **Rôles institutionnels** (`institution-*`) : rôles *fonctionnels*, indépendants de
  l'institution à laquelle ils s'appliquent. L'isolation multi-tenant (« cette
  institution ne voit que ses propres membres affiliés ») n'est **pas** portée par le
  rôle lui-même mais par le **groupe Keycloak** auquel l'utilisateur appartient (voir
  §"Multi-tenant : rôles vs. groupes").

## Rôles de niveau membre (`member-*`)

| Rôle | Correspond à (doc 02, §Niveaux) | Composite |
|---|---|---|
| `member-standard` | Standard | implique `member` |
| `member-silver` | Silver | implique `member` |
| `member-gold` | Gold (direct ou via employeur partenaire vérifié — voir doc 02 §"Gold via employeur partenaire") | implique `member` |
| `member-founding` | Founding | implique `member` |
| `member-honorary` | Honorary | implique `member` |
| `member-institutional-affiliate` | Institutional Affiliate | implique `member` |

Traduction fonctionnelle par bounded context :

- **Membership** : le rôle `member-*` reflète `Membership.tier` (voir modèle minimal
  du doc 02). Le changement de tier (upgrade Gold via `EmploymentAffiliation`
  vérifiée, attribution Founding/Honorary par l'OEI) doit être répercuté à la fois
  côté base de données (backend futur) et côté rôle Keycloak (rôle unique attribué,
  les précédents retirés).
- **Profile / CV / Badge** : aucune règle de visibilité n'est déterminée uniquement
  par le rôle Keycloak — le rôle conditionne l'accès aux *actions* (ex. seul un
  membre actif peut publier son profil), les règles de contenu (complétude,
  éligibilité à un badge) restent des règles de domaine côté backend.
- **Wallet** : la couleur de niveau (`WalletPass.levelColor`) et le contenu du pass
  mocké dépendent du tier, donc indirectement du rôle.

## Rôles institutionnels (`institution-*`)

| Rôle | Correspond à (doc 03, §Rôles) | Droit fonctionnel type |
|---|---|---|
| `institution-owner` | propriétaire | seul à transférer la propriété ou clôturer le compte ; hérite implicitement de tous les droits `institution-admin` (à modéliser côté backend, pas en composite Keycloak pour garder la liste des droits explicite en JWT) |
| `institution-admin` | administrateur | gère `InstitutionRole`/`InstitutionMembership`, les invitations, les paramètres du compte (`PUT /api/institution/v1/account`) |
| `institution-hr` | RH | gère `MemberInstitutionAffiliation` (départs), les avantages collaborateurs |
| `institution-tech-lead` | responsable technique | référent groupes de travail, opportunités techniques |
| `institution-comms` | communication | crée/soumet `InstitutionPublication` |
| `institution-reader` | lecteur | lecture seule du dashboard (`GET /api/institution/v1/dashboard`) et de la bibliothèque, aucune action d'écriture |
| `institution-contributor` | contributeur | propose des publications/contributions sans droit de validation finale |
| `institution-affiliation-validator` | validateur d'affiliation | seul rôle habilité à `POST /api/institution/v1/affiliations/{id}/approve` / `reject` |

Ces huit rôles sont **fonctionnels et transverses** : ils ne portent, à eux seuls,
aucune information sur *quelle* institution ils concernent.

## Multi-tenant : rôles vs. groupes

Une institution ne doit voir/gérer que ses propres membres affiliés. Deux options
étaient possibles :

1. **Client roles par institution** (ex. `oei-institution-{id}` avec ses propres
   rôles) — rejeté : cela suppose de créer un client Keycloak par institution, ce qui
   ne passe pas à l'échelle (des dizaines/centaines d'institutions attendues) et
   complique la fédération SSO.
2. **Realm roles fonctionnels + Groupes Keycloak par institution** — retenu. Chaque
   institution correspond à un groupe `/institutions/{institutionId}` :
   - le groupe porte un attribut `institutionId` (et `isDemoData` si fictif) ;
   - les utilisateurs de l'équipe institutionnelle sont membres de ce groupe et se
     voient attribuer un rôle `institution-*` via ce groupe (role mapping sur le
     groupe, pas sur l'utilisateur directement, pour que "quitter l'institution" =
     "quitter le groupe") ;
   - un protocol mapper `oidc-group-membership-mapper` (configuré sur le client
     `oei-frontend` dans `oei-realm.json`) expose le chemin complet du groupe
     (`groups: ["/institutions/{institutionId}"]`) dans le JWT ;
   - **le backend Spring (futur)** reste seul responsable de l'isolation stricte :
     à chaque requête `/api/institution/v1/**`, il doit résoudre l'`institutionId`
     depuis la claim `groups` du token et filtrer toutes les requêtes sur cet
     identifiant — Keycloak ne fait que porter l'information, pas l'appliquer.

Un groupe `/institutions/demo-institution` (attributs `institutionId:
demo-institution`, `isDemoData: true`) est inclus dans `oei-realm.json` à titre
d'exemple/gabarit pour la donnée de démonstration (règle d'honnêteté des données de
démo — voir `00-CONTEXTE-GLOBAL-OEI.md`). Il n'est affecté à aucun utilisateur réel.

## Rôle `admin`

Inchangé : reste le rôle de modération/administration OEI globale
(`/api/admin/v1/**` dans le contrat OpenAPI). Aucune décomposition en sous-rôles
d'admin n'a été introduite à ce stade (hors périmètre de cette fondation ; à
affiner par le chantier CMS/Gouvernance si un besoin de séparation
légal/gouvernance/technique apparaît — voir `ContentApproval.role` dans le contrat
OpenAPI qui distingue déjà `LEGAL`/`GOVERNANCE` comme rôle *métier* porté par la
donnée, pas encore comme rôle Keycloak).

## Comment ça a été vérifié

Les rôles ont été créés en live sur le conteneur `oei-keycloak-1` (Keycloak 25,
realm `oei` déjà importé) via :

```bash
docker exec oei-keycloak-1 /opt/keycloak/bin/kcadm.sh \
  config credentials --server http://localhost:8080 --realm master \
  --user "$OEI_USER" --password "$OEI_PASSWORD"

docker exec oei-keycloak-1 /opt/keycloak/bin/kcadm.sh \
  create roles -r oei -s name=member-gold -s description="..."

docker exec oei-keycloak-1 /opt/keycloak/bin/kcadm.sh \
  add-roles -r oei --rname member-gold --rolename member
```

Vérification finale :

```bash
docker exec oei-keycloak-1 /opt/keycloak/bin/kcadm.sh get realms/oei/roles
```

confirme la présence des 16 rôles applicatifs (`member`, `admin`, 6× `member-*`,
8× `institution-*`), en plus des 3 rôles techniques gérés nativement par Keycloak
(`default-roles-oei`, `offline_access`, `uma_authorization`) — soit 19 rôles au
total dans le realm. Les 6 rôles `member-*` sont marqués `"composite": true`
(impliquant `member`).

`keycloak/realm-export/oei-realm.json` a été mis à jour en parallèle pour que ce
même modèle soit reproduit à froid par tout `docker-compose up` futur
(`--import-realm`), sans dépendre de l'état du conteneur actuellement démarré.
