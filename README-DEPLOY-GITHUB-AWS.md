# Deployment GitHub + AWS (OEI)

Ce guide donne les commandes exactes pour publier une nouvelle version backend/frontend et la configuration CI/CD automatique sur `main`.

## 1) Ce qui stocke quoi

- `DynamoDB` : verrou Terraform (`oei-terraform-locks`), **pas** les secrets applicatifs.
- `AWS SSM Parameter Store` : secrets/variables runtime de l'application (`/oei/prod/*`).
- `GitHub Actions Variables` : paramètres non secrets du pipeline (rôle IAM, région, bucket, CloudFront ID).

## 2) Variables GitHub à configurer (une seule fois)

Dans GitHub: `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`.

Créer :
- `AWS_DEPLOY_ROLE_ARN` (ex: `arn:aws:iam::982408502536:role/oei-github-actions-deploy`)
- `AWS_REGION` (ex: `eu-west-3`)
- `FRONTEND_S3_BUCKET` (ex: `oei-web-static`)
- `FRONTEND_CLOUDFRONT_DISTRIBUTION_ID` (ex: `E1SCZ4YGPTAUBZ`)
- `TF_DOMAIN_NAME` (ex: `theitorder.global`)
- `TF_SSH_ALLOWED_CIDR` (ex: `203.0.113.10/32`)
- `TF_BUDGET_ALERT_EMAIL` (ex: `ops@theitorder.global`)
- `TF_MONTHLY_BUDGET_AMOUNT_USD` (ex: `80`)
- `TF_SSH_PUBLIC_KEY` (contenu de la cle publique SSH, ex `ssh-ed25519 ...`)

Aucune clé AWS longue durée n'est nécessaire si OIDC est correctement configuré.

Terraform gère aussi le record DMARC (`_dmarc.<domain>`) et les records DKIM SES
dans Route53 (voir `.prompt/deployment/terraform/ses.tf`).

## 3) Variables runtime applicatives dans SSM (une seule fois, puis rotation si besoin)

```bash
aws ssm put-parameter --name /oei/prod/OEI_USER --type SecureString --value 'oei_admin' --overwrite
aws ssm put-parameter --name /oei/prod/OEI_PASSWORD --type SecureString --value 'CHANGE_ME' --overwrite
aws ssm put-parameter --name /oei/prod/POSTGRES_DB --type String --value 'oei' --overwrite
aws ssm put-parameter --name /oei/prod/OEI_APP_PASSWORD --type SecureString --value 'CHANGE_ME' --overwrite
aws ssm put-parameter --name /oei/prod/OEI_OIDC_ISSUER_URI --type String --value 'https://auth.theitorder.global/realms/oei' --overwrite
aws ssm put-parameter --name /oei/prod/OEI_SMTP_HOST --type String --value 'email-smtp.eu-west-3.amazonaws.com' --overwrite
aws ssm put-parameter --name /oei/prod/OEI_SMTP_PORT --type String --value '587' --overwrite
aws ssm put-parameter --name /oei/prod/OEI_SMTP_USERNAME --type SecureString --value 'CHANGE_ME' --overwrite
aws ssm put-parameter --name /oei/prod/OEI_SMTP_PASSWORD --type SecureString --value 'CHANGE_ME' --overwrite
aws ssm put-parameter --name /oei/prod/OEI_MAIL_FROM --type String --value 'no-reply@theitorder.global' --overwrite
aws ssm put-parameter --name /oei/prod/GRAFANA_ADMIN_USER --type String --value 'admin' --overwrite
aws ssm put-parameter --name /oei/prod/GRAFANA_ADMIN_PASSWORD --type SecureString --value 'CHANGE_ME' --overwrite
aws ssm put-parameter --name /oei/prod/GRAFANA_BASICAUTH_USER --type String --value 'admin' --overwrite
aws ssm put-parameter --name /oei/prod/GRAFANA_BASICAUTH_PASSWORD_HASH --type SecureString --value 'CHANGE_ME_BCRYPT' --overwrite
```

Important : les emails de création/vérification de compte sont envoyés par
**Keycloak**, pas par le backend Spring. Il ne suffit donc pas de renseigner
`OEI_SMTP_*` pour le backend : il faut aussi que le realm Keycloak de
production soit configuré avec ces mêmes valeurs SMTP.

## 4) Publication manuelle backend (si nécessaire)

```bash
cd /Users/ydeungoue/projects/oei/backend
mvn -B clean package -DskipTests -pl application/web -am
```

```bash
AWS_ACCOUNT_ID=982408502536
AWS_REGION=eu-west-3
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

docker build --platform linux/arm64 -f application/web/Dockerfile -t "${ECR_REGISTRY}/oei-backend:latest" .
docker push "${ECR_REGISTRY}/oei-backend:latest"
```

```bash
ssh -i /Users/ydeungoue/oei-prod-key.pem ec2-user@52.47.88.137 '
cd ~/oei/infra
chmod +x ./scripts/fetch-secrets.sh
./scripts/fetch-secrets.sh .env
docker compose -f docker-compose.prod.yml --env-file .env pull backend
docker compose -f docker-compose.prod.yml --env-file .env up -d --no-deps backend
docker compose -f docker-compose.prod.yml --env-file .env up --no-deps keycloak-realm-config
'
```

## 5) Publication manuelle frontend (si nécessaire)

```bash
cd /Users/ydeungoue/projects/oei/frontend/oei-web
pnpm install --frozen-lockfile
pnpm run build:api
```

```bash
aws s3 sync dist/oei-web/browser s3://oei-web-static --delete --cache-control "public,max-age=31536000,immutable" --exclude "index.html"
aws s3 cp dist/oei-web/browser/index.html s3://oei-web-static/index.html --cache-control "no-cache"
aws cloudfront create-invalidation --distribution-id E1SCZ4YGPTAUBZ --paths "/" "/index.html"
```

## 6) CI/CD automatique au push sur main

Les workflows sont configurés pour :
- `CI` sur chaque push/PR `main` (`.github/workflows/ci.yml`)
- `Deploy App` auto sur push `main` quand backend/infra backend changent (`.github/workflows/deploy-app.yml`)
- `Deploy Frontend` auto sur push `main` quand frontend/content changent (`.github/workflows/deploy-frontend.yml`)

Recommandé :
1. Protéger `main` avec règle "Require status checks" sur le workflow `CI`.
2. Optionnel: utiliser des `Environments` GitHub (ex: `production`) avec approbation manuelle avant job de déploiement.

## 7) Vérification post-déploiement

```bash
curl -sS https://theitorder.global/config.json | cat
curl -sS -D - https://api.theitorder.global/actuator/health/readiness -o /tmp/readiness.json
cat /tmp/readiness.json
curl -sS -D - https://auth.theitorder.global/realms/oei -o /tmp/realm.json
head -c 200 /tmp/realm.json
```

Vérification SMTP/Keycloak après une mise à jour secrets ou une première mise
en place SES :

```bash
ssh -i /Users/ydeungoue/oei-prod-key.pem ec2-user@52.47.88.137 '
cd ~/oei/infra
chmod +x ./scripts/fetch-secrets.sh
./scripts/fetch-secrets.sh .env
docker compose -f docker-compose.prod.yml --env-file .env up --no-deps keycloak-realm-config
docker compose -f docker-compose.prod.yml --env-file .env logs --no-color keycloak-realm-config | tail -n 100
'
```

## 8) Exposition Grafana HTTPS (Caddy + auth renforcée)

Prérequis DNS : créer `grafana.theitorder.global` vers la même IP publique que Caddy.

```bash
ssh -i /Users/ydeungoue/oei-prod-key.pem ec2-user@52.47.88.137 '
cd ~/oei/infra
docker compose -f docker-compose.prod.yml --env-file .env --profile obs pull
docker compose -f docker-compose.prod.yml --env-file .env --profile obs up -d
'
```

Validation rapide :

```bash
curl -I https://grafana.theitorder.global
curl -u admin:CHANGE_ME -I https://grafana.theitorder.global/login
```

