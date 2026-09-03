# Email OTP Authenticator — Keycloak

## Contexte

Le realm `oei` définit déjà `CONFIGURE_TOTP` (TOTP applicatif, opt-in — `defaultAction: false`
dans `keycloak/realm-export/oei-realm.json`), mais Keycloak ne fournit **aucun** authenticator
"code à usage unique par email" prêt à l'emploi (seulement TOTP/WebAuthn/Verify Email). Cette
extension ajoute cet authenticator manquant, comme mesure de sécurité obligatoire (pas
optionnelle) pour toute connexion membre via le flow browser.

Elle réutilise l'infrastructure email déjà en place côté Keycloak (SMTP/SES configuré sur le
realm, thème `keycloak/themes/oei/email/`) plutôt que d'envoyer l'email depuis le backend
Spring — cohérent avec le choix existant du projet où les emails liés au compte (vérification,
reset mot de passe) sont gérés par Keycloak lui-même.

## Ce que fait le code

- `EmailOtpAuthenticator` : à l'étape d'authentification, génère un code numérique (6 chiffres
  par défaut), le stocke dans les notes de la session d'authentification (jamais en base), et
  l'envoie via `EmailTemplateProvider` avec les templates `email-otp.ftl` (HTML + texte, voir
  `keycloak/themes/oei/email/html/email-otp.ftl` et `.../text/email-otp.ftl`). Vérifie le code
  soumis, gère l'expiration (5 min par défaut), le nombre maximum de tentatives (5 par défaut)
  et le renvoi de code ("Resend").
- `EmailOtpAuthenticatorFactory` : déclare le provider `oei-email-otp-authenticator` auprès de
  Keycloak (propriétés configurables : longueur du code, durée de validité, tentatives max).
- Formulaire de saisie : `keycloak/themes/oei/login/login-email-otp.ftl` (+ clés i18n dans
  `keycloak/themes/oei/login/messages/messages_*.properties`, 6 langues).

## Build

Prérequis : JDK 17+ et Maven (`brew install maven` si absent).

```bash
./infra/scripts/build-keycloak-extensions.sh
```

Ce script compile tous les modules sous `keycloak/extensions/*/pom.xml` et copie les jars
produits dans `keycloak/providers/`, monté par `infra/docker-compose*.yml` dans
`/opt/keycloak/providers`. `start-dev`/`start` détectent le nouveau provider et reconstruisent
automatiquement le serveur au démarrage suivant (`docker compose up -d --force-recreate
keycloak`, ou simplement un redémarrage du conteneur).

Pour lancer uniquement les tests unitaires de ce module :

```bash
mvn -f keycloak/extensions/email-otp-authenticator/pom.xml test
```

## Wiring dans le realm (déjà fait dans `oei-realm.json`)

Un authenticator ne peut pas être ajouté à un flow *built-in* de Keycloak (`browser` de base est
protégé). Le realm export définit donc une copie non-built-in du flow `browser` (alias
`browser`, remplaçant le flow par défaut du même nom) dont le sous-flow `forms (email OTP)`
ajoute l'exécution `oei-email-otp-authenticator` en `REQUIRED`, après le formulaire
identifiant/mot de passe et le sous-flow TOTP conditionnel existant. Le realm pointe
`browserFlow` vers ce flow. Reproduit en repartant de zéro via :

```bash
mvn -f keycloak/extensions/email-otp-authenticator/pom.xml -DskipTests package
cp keycloak/extensions/email-otp-authenticator/target/*.jar keycloak/providers/
docker compose -f infra/docker-compose.yml --env-file infra/env.local up -d --force-recreate keycloak
```

Validé de bout en bout (import réaliste sur une base Postgres vierge + login complet avec envoi
réel de l'email via Mailpit, code correct, code erroné, renvoi de code) pendant le développement
de cette extension.

## Limites connues / ce qu'il reste à faire

- **Aucune UI de gestion** : impossible pour un membre de désactiver ce MFA (voulu — c'est une
  mesure de sécurité imposée, pas une option comme `CONFIGURE_TOTP`).
- **Pas de rate-limiting dédié** au-delà de `maxAttempts` par code : un compte ciblé par une
  attaque par déni de service (spam d'envois d'email en boucle via "Resend") n'est pour l'instant
  protégé que par la protection anti brute-force générique du realm — à durcir si besoin
  (ex. cooldown minimum entre deux renvois).
- **Image Docker de production** : le provider est chargé via un volume monté +
  reconstruction automatique au démarrage (`start`/`start-dev`), ce qui ajoute ~10-20s à chaque
  redémarrage de Keycloak en prod. Pour un déploiement plus robuste, il vaudrait mieux figer le
  jar dans une image Keycloak custom construite en CI (`Dockerfile` multi-stage + `kc.sh build`)
  plutôt que de compter sur l'auto-rebuild.
- **CI** : ce module Maven n'est pas encore branché sur le pipeline d'intégration continue
  (`.github/workflows/`) — à ajouter si on veut que les tests soient exécutés automatiquement à
  chaque PR touchant `keycloak/extensions/`.
