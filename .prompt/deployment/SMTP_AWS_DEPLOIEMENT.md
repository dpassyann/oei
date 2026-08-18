# SMTP Keycloak en local (Mailpit) et en production AWS

Ce document explique comment passer de la configuration locale (Mailpit) a une configuration de production sur AWS pour les emails de verification Keycloak.

## Ce qui est deja configure en local

Le realm `../../keycloak/realm-export/oei-realm.json` contient maintenant:

- `host: mailpit`
- `port: 1025`
- `from: no-reply@oei.local`
- `auth: false`
- `starttls: false`
- `ssl: false`

Cela fonctionne quand Keycloak tourne dans Docker Compose sur le meme reseau que le service `mailpit`.

## Objectif pour AWS

En production AWS, il faut remplacer Mailpit par un vrai serveur SMTP. Le chemin recommande est **Amazon SES (SMTP endpoint)**.

## Etapes de mise en place sur AWS (SES)

### 1) Preparer l'identite d'envoi SES

1. Aller dans Amazon SES (region cible).
2. Verifier le domaine (recommande) ou l'adresse d'envoi.
3. Si le compte SES est en sandbox, demander la sortie de sandbox pour envoyer a des destinataires reels.

### 2) Creer les identifiants SMTP SES

1. Dans SES, creer des identifiants SMTP (username/password SMTP).
2. Stocker ces secrets dans AWS Secrets Manager ou SSM Parameter Store.
3. Ne jamais committer ces secrets dans le repo.

### 3) Choisir l'endpoint SMTP selon la region

Exemples:

- `email-smtp.eu-west-1.amazonaws.com`
- `email-smtp.us-east-1.amazonaws.com`

Port recommande:

- `587` avec STARTTLS (`starttls=true`, `ssl=false`)

### 4) Configurer Keycloak en production

Option recommandee: garder le realm local pour le dev, puis injecter la config SMTP de prod au deploiement (secret + variable d'env + script d'import/update realm).

Valeurs SMTP de production typiques:

- `host`: endpoint SMTP SES de la region
- `port`: `587`
- `from`: adresse verifiee SES (ex: `no-reply@votre-domaine.com`)
- `fromDisplayName`: nom public de l'organisation
- `auth`: `true`
- `user`: SMTP username SES
- `password`: SMTP password SES
- `starttls`: `true`
- `ssl`: `false`

### 5) Appliquer la config sans casser le local

Deux approches possibles:

1. **Realm override en CI/CD**
   - Conserver `oei-realm.json` pour le local.
   - En pipeline, patcher `smtpServer` avec les valeurs AWS avant import du realm.

2. **Configuration via Admin API/Console apres import**
   - Importer le realm.
   - Mettre a jour `Realm Settings > Email` avec les secrets injectes.

## Exemple de bloc SMTP pour AWS (JSON)

```json
"smtpServer": {
  "host": "email-smtp.eu-west-1.amazonaws.com",
  "port": "587",
  "from": "no-reply@votre-domaine.com",
  "fromDisplayName": "Ordre International des Experts",
  "auth": "true",
  "user": "${SMTP_USER}",
  "password": "${SMTP_PASSWORD}",
  "starttls": "true",
  "ssl": "false"
}
```

> Note: selon votre methode de deploiement Keycloak, la resolution `${SMTP_USER}` / `${SMTP_PASSWORD}` peut necessiter un pre-processing du JSON ou une mise a jour via script/API.

## Validation apres deploiement

1. Dans Keycloak Admin, tester l'envoi email depuis `Realm Settings > Email`.
2. Creer un nouvel utilisateur avec `VERIFY_EMAIL` active.
3. Verifier la reception de l'email.
4. Verifier les logs Keycloak en cas d'echec (`SEND_VERIFY_EMAIL_ERROR`, `KC-SERVICES0029`).

## Checklist production

- Domaine/expediteur SES verifie
- SES hors sandbox (ou destinataires autorises)
- Secrets SMTP dans Secrets Manager/SSM
- SMTP prod injecte dans Keycloak
- Test d'envoi ok dans l'admin Keycloak
- Flux d'inscription + verification email valide

