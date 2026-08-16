# Thème email OEI — Keycloak

## Contexte

Depuis ce changement, `verifyEmail: true` dans `keycloak/realm-export/oei-realm.json` : à
l'inscription (`KeycloakAuthService.register()` côté frontend → écran d'enregistrement natif
Keycloak), un required action `VERIFY_EMAIL` (`enabled: true`, `defaultAction: true`, voir
`requiredActions` dans le realm export) est automatiquement attribué au nouveau membre, et
Keycloak envoie un email de vérification via ce thème.

Ce dossier (`keycloak/themes/oei/email/`) contient le thème email Keycloak aux couleurs OEI,
en remplacement du stub `parent=base` vide qui existait auparavant.

## Templates surchargés

`keycloak/themes/oei/email/html/` :

- `template.ftl` — layout partagé (macro `emailLayout` + macro `ctaButton`), importé par
  **tous** les templates email de base (surchargés ici ou non), grâce à la résolution de thème
  Keycloak (parent fallback). Bandeau navy `#0a1e3f` / doré `#e8a530`, bouton d'action doré,
  pied de page avec liens légaux — copié à l'identique du shell Thymeleaf des emails Spring
  (`backend/infrastructure/mail/src/main/resources/templates/email/fragments/shell.html`).
- `email-verification.ftl` — email de vérification d'adresse (déclenché par `verifyEmail: true`
  à l'inscription, ou par le required action VERIFY_EMAIL).
- `password-reset.ftl` — réinitialisation de mot de passe.
- `executeActions.ftl` — email générique "mettre à jour votre compte" (actions requises en
  attente, ex. VERIFY_EMAIL si l'action est déclenchée hors inscription).
- `identity-provider-link.ftl` — confirmation de liaison de compte à un fournisseur d'identité
  externe.
- `email-test.ftl` — email de test déclenché par le bouton "Realm settings → Email →
  Test connection" de la console d'administration.

Les autres templates email de base (`org-invite.ftl`, `email-update-confirmation.ftl`,
`email-verification-with-code.ftl`, `event-login_error.ftl`, `event-remove_totp.ftl`,
`event-update_password.ftl`, `event-update_totp.ftl` — cf. liste complète trouvée dans
`org.keycloak.keycloak-themes-25.0.6.jar!/theme/base/email/html/`) ne sont **pas** dupliqués
ici : ils restent hérités du thème `base`, mais bénéficient déjà automatiquement du layout OEI
(bandeau/pied de page) via la surcharge de `template.ftl` ci-dessus, puisque chaque `.ftl` de
base fait `<#import "template.ftl" as layout>`, résolu par Keycloak dans le thème courant avec
fallback sur le parent. Seul le corps de ces emails non dupliqués reste en anglais/langue de
base non stylisé (pas de bouton). À dupliquer si besoin plus tard sur le même modèle.

## i18n native Keycloak

`keycloak/themes/oei/email/messages/messages_{fr,en,es,de,it,pt}.properties` — mécanisme de
résolution de message natif Keycloak (`msg("clé", arg0, arg1, ...)` dans les `.ftl`, résolu
selon la locale de l'utilisateur/du realm, avec repli sur `base` pour les clés non redéfinies
ici, ex. les sujets `emailVerificationSubject`/`passwordResetSubject`/etc. et les libellés
`requiredAction.*`, déjà traduits en amont par Keycloak pour ces 6 langues).

Le texte du pied de page (`emailFooterNavHome`/`emailFooterNavMemberSpace`/
`emailFooterNavContact`/`emailFooterLegal`/`emailFooterUnsubscribe`) reprend mot pour mot les
traductions déjà utilisées côté Spring
(`backend/infrastructure/mail/src/main/resources/email/messages_{locale}.properties`, clés
`email.shell.*`) pour qu'un membre ne voie aucune différence de ton entre un email de compte
Keycloak et un email transactionnel OEI.

`keycloak/themes/oei/email/theme.properties` : `locales=fr,en,es,de,it,pt` en plus de
`parent=base`.

## Configuration SMTP — développement local vs production

### Local (`infra/docker-compose.yml`)

Aucune configuration SMTP n'est définie dans le realm export ni dans le conteneur Keycloak
local (`smtpServer` absent de `oei-realm.json`). Keycloak logue simplement une tentative
d'envoi échouée dans sa console (`docker logs oei-keycloak-1`) — suffisant pour valider que le
flux (inscription → required action VERIFY_EMAIL → tentative d'email) se déclenche bien, sans
qu'un vrai serveur SMTP soit nécessaire en local.

### Production — Amazon SES

Cohérent avec la décision déjà prise pour les emails transactionnels Spring
(`backend/infrastructure/mail/`, voir aussi `.prompt/deployment/deploiement-aws.md`) : Amazon
SES est le fournisseur SMTP de production, **à renseigner à la main** (console Admin Keycloak,
onglet *Realm settings → Email*, ou `kcadm.sh` en session admin) — ne jamais committer de
vraies valeurs dans `oei-realm.json`.

Champs à renseigner (valeurs ci-dessous = **placeholders explicites**, pas de vraies clés) :

| Champ Keycloak (`smtpServer.*`) | Valeur en production |
|---|---|
| `host` | `email-smtp.<région-aws>.amazonaws.com` (ex. `email-smtp.eu-west-1.amazonaws.com` — utiliser la même région AWS que le reste de l'infra, voir `.prompt/deployment/deploiement-aws.md`) |
| `port` | `587` |
| `starttls` | `true` |
| `auth` | `true` |
| `user` | `<SES_SMTP_USERNAME>` — identifiant **SMTP** généré par SES (Simple Mail Transfer Protocol → Credentials), **différent** d'une clé IAM `AKIA...` brute |
| `password` | `<SES_SMTP_PASSWORD>` — mot de passe SMTP dérivé associé, généré une seule fois à la création des identifiants SES SMTP |
| `from` | `no-reply@oei.global` (ou domaine équivalent, à vérifier/valider au préalable dans SES — *Verified identities*) |
| `fromDisplayName` | `Ordre International des Experts de l'Informatique` |
| `replyTo` | optionnel, ex. `contact@oei.global` |
| `envelopeFrom` | optionnel (SPF) |
| `ssl` | `false` (STARTTLS sur 587, pas de SMTPS direct sur 465) |

Exemple d'application via `kcadm.sh` (à exécuter en production, jamais en local avec de vraies
valeurs) :

```bash
kcadm.sh update realms/oei \
  -s 'smtpServer.host=email-smtp.<région-aws>.amazonaws.com' \
  -s 'smtpServer.port=587' \
  -s 'smtpServer.starttls=true' \
  -s 'smtpServer.auth=true' \
  -s 'smtpServer.user=<SES_SMTP_USERNAME>' \
  -s 'smtpServer.password=<SES_SMTP_PASSWORD>' \
  -s 'smtpServer.from=no-reply@oei.global' \
  -s "smtpServer.fromDisplayName=Ordre International des Experts de l'Informatique"
```

Le domaine d'envoi (`no-reply@oei.global`) doit être une identité vérifiée dans SES (DKIM/SPF
configurés au niveau DNS), et le compte SES doit être sorti du "sandbox" SES (limite de
destinataires vérifiés) avant l'ouverture aux membres réels — démarche identique à celle déjà
requise côté Spring pour les emails transactionnels.

## Tester en local

1. Le thème (`css`/`.ftl`/`.properties`) est monté en volume
   (`../keycloak/themes/oei:/opt/keycloak/themes/oei` dans `infra/docker-compose.yml`) — toute
   modification est visible sans rebuild d'image, mais un `docker compose restart keycloak`
   force le rechargement du cache de thème en cas de doute.
2. Le realm (`oei-realm.json`) n'est importé qu'une fois au premier démarrage du volume
   Postgres (`--import-realm`) — les changements de `verifyEmail`/`supportedLocales`/
   `requiredActions` de ce commit ont donc été appliqués **en live** sur le conteneur déjà
   démarré via `kcadm.sh update realms/oei -s ...` (voir historique de commande), pour test
   immédiat sans perte des données de test locales. Une recréation complète du realm
   (`docker compose down && docker volume rm ... && docker compose up`) appliquerait aussi ces
   changements depuis `oei-realm.json` directement.
3. Lancer un flux d'inscription (frontend sur `http://localhost:4300`, bouton "Rejoignez le
   mouvement" en étant déconnecté, ou directement
   `http://localhost:8081/realms/oei/protocol/openid-connect/registrations?client_id=oei-frontend&response_type=code&redirect_uri=http://localhost:4300`)
   puis vérifier `docker logs oei-keycloak-1` : une tentative d'envoi de l'email de
   vérification doit apparaître (échec attendu en local, aucun SMTP configuré — voir
   ci-dessus).
