# Pipeline CI/CD GitHub Actions — déploiement AWS piloté par l'assistant

> Ce document explique comment le déploiement AWS de OEI est piloté de bout
> en bout par l'assistant IA via GitHub Actions, plutôt que par des
> commandes AWS CLI/Terraform tapées manuellement. Il complète
> [`deploiement-aws.md`](deploiement-aws.md) (le manuel d'infrastructure) et
> [`terraform/README.md`](terraform/README.md) (le Terraform lui-même).

## Pourquoi ce détour par GitHub Actions

L'environnement d'exécution de l'assistant (sandbox) n'a **aucun accès
réseau vers les API AWS** et ne peut pas lire `~/.aws/credentials` — c'est
une contrainte dure de la plateforme, pas un choix. Il ne peut donc **jamais**
exécuter directement `terraform apply`, `aws ec2 ...`, etc.

En revanche, GitHub est un hôte réseau autorisé pour l'assistant. La
solution est donc :

- l'exécution réelle des opérations AWS se fait sur des **runners GitHub
  Actions** (accès réseau AWS normal, aucune restriction de sandbox) ;
- l'authentification AWS de ces runners se fait par **fédération d'identité
  OIDC** (`token.actions.githubusercontent.com` → un rôle IAM assumable
  uniquement par ce repo, sur la branche `main`) — **aucune clé d'accès
  AWS longue durée** n'est jamais stockée dans GitHub ;
- l'assistant **pilote** ces workflows (déclenchement, lecture des logs) via
  `gh workflow run` / `gh run watch`, qui sont des appels à l'API GitHub, pas
  à l'API AWS.

## 1. Bootstrap manuel unique (à faire UNE SEULE FOIS, par vous, depuis votre machine)

C'est la **seule** étape de tout ce pipeline où vous devez taper des
commandes AWS vous-même, avec vos propres identifiants (`aws configure
--profile oei-admin`, cf. `deploiement-aws.md` §3.2). Tant qu'elle n'est pas
faite, **aucun workflow GitHub Actions ne peut fonctionner** : le rôle IAM
OIDC que ces workflows assument n'existe pas encore, et rien ne peut le créer
à distance (paradoxe classique : le rôle qui permettrait à GitHub Actions de
faire du Terraform doit d'abord exister, donc son tout premier `apply` ne
peut pas passer par GitHub Actions).

### 1.1. Créer le bucket S3 + la table DynamoDB du state Terraform distant

```bash
cd .prompt/deployment/terraform

aws s3api create-bucket \
  --bucket oei-terraform-state \
  --region eu-west-3 \
  --create-bucket-configuration LocationConstraint=eu-west-3

aws s3api put-bucket-versioning \
  --bucket oei-terraform-state \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket oei-terraform-state \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws s3api put-public-access-block \
  --bucket oei-terraform-state \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws dynamodb create-table \
  --table-name oei-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-3
```

### 1.2. Migrer le state local existant vers ce backend

Le state actuel (`terraform.tfstate` dans ce dossier, créé par un agent
précédent) est **local**. `backend.tf` déclare déjà le backend `s3` distant
— il ne reste qu'à migrer :

```bash
terraform init -migrate-state
# Terraform demande confirmation : répondre "yes".
```

### 1.3. Premier `terraform apply` LOCAL (avec vos propres credentials)

Ce premier apply crée notamment le rôle IAM OIDC (`github_oidc.tf`) que
GitHub Actions utilisera pour **tous les déploiements suivants**. C'est la
seule fois où `apply` tourne depuis votre machine et non depuis un workflow :

```bash
cp terraform.tfvars.example terraform.tfvars   # si pas déjà fait
# éditer terraform.tfvars avec vos vraies valeurs (domain_name, ssh_*, budget_alert_email, ...)

terraform plan
terraform apply
```

Récupérez ensuite l'ARN du rôle créé :

```bash
terraform output -raw github_actions_deploy_role_arn
```

## 2. Configurer le repo GitHub (variables, pas secrets)

Un ARN de rôle IAM n'est pas une information sensible (il ne permet rien
sans la fédération OIDC configurée dans sa trust policy) — on le stocke donc
en **variable de repo**, pas en secret :

```bash
gh variable set AWS_DEPLOY_ROLE_ARN --body "$(terraform output -raw github_actions_deploy_role_arn)"
gh variable set AWS_REGION --body "eu-west-3"
```

`gh` doit être authentifié pour ces deux commandes (`gh auth login`) — ce
n'est pas le cas dans l'environnement sandbox de l'assistant, donc **vous**
devez les exécuter (ou vous authentifier `gh` puis laisser l'assistant les
lancer).

## 3. Ensuite : l'assistant pilote, vous ne touchez plus à AWS directement

Une fois les étapes 1 et 2 faites, l'assistant déclenche et suit chaque
déploiement via l'API GitHub (autorisée pour son environnement), jamais via
l'API AWS directement :

```bash
# Infrastructure (VPC/EC2/S3/CloudFront/IAM/OIDC/ECR/budgets...)
gh workflow run deploy-infra.yml -f action=plan     # ou apply / destroy
gh run watch

# Application (build+push de l'image backend, rollout SSM sur l'instance)
gh workflow run deploy-app.yml
gh run watch
```

`deploy-infra.yml` (workflow_dispatch, input `action` = `plan`/`apply`/
`destroy`, défaut `plan`) exécute `terraform init/plan/apply/destroy` dans
`.prompt/deployment/terraform/`, authentifié par OIDC
(`aws-actions/configure-aws-credentials@v4`, `role-to-assume:
${{ vars.AWS_DEPLOY_ROLE_ARN }}`).

`deploy-app.yml` (workflow_dispatch, aucun déclenchement automatique sur
push — le porteur du projet veut approuver chaque déploiement
explicitement) a deux jobs :

1. **build-and-push** : `mvn clean package -pl application/web -am
   -DskipTests` (les tests tournent déjà dans `ci.yml` sur chaque push/PR
   vers `main` ; les re-exécuter ici ne ferait que ralentir un déploiement
   déjà approuvé), build du `backend/application/web/Dockerfile`
   multi-stage (layertools Spring Boot, cf. `deploiement-aws.md` §8.1), tag
   `<sha-court>` + `latest`, push vers le dépôt ECR `oei-backend`.
2. **rollout** : résout l'instance EC2 taguée `Name=oei-prod`, envoie une
   commande `docker compose pull && up -d --no-deps backend` via **AWS
   Systems Manager `send-command`** (document `AWS-RunShellScript`) —
   aucune clé SSH n'est manipulée par le pipeline, cohérent avec la posture
   sécurité du manuel (§5, aucun port ouvert vers Postgres/Keycloak/backend,
   SSH restreint à l'IP admin et non utilisé ici). Le job attend la fin de
   la commande (`aws ssm wait command-executed` puis
   `get-command-invocation`) et échoue si le statut n'est pas `Success`.

`ci.yml` (push/PR sur `main`) est le filet de sécurité qui tourne **avant**
tout déploiement : `mvn clean verify` (backend) + `pnpm run test` / `pnpm run
build` (frontend). Il ne configure aucune credential AWS — il est safe à
exécuter sur des PRs, y compris depuis un fork.

## 4. Rappel important

**Tant que l'étape 1 (bootstrap manuel) n'est pas faite, aucun workflow
GitHub Actions de ce repo ne peut fonctionner** : `AWS_DEPLOY_ROLE_ARN`
n'existe pas encore côté GitHub, et même si elle existait, le rôle IAM
qu'elle désignerait n'existerait pas encore côté AWS (il est créé par ce
même bootstrap). Ordre strict à respecter :

1. Bootstrap manuel (§1) — une fois, depuis votre machine, avec vos
   identifiants AWS.
2. Configuration des variables GitHub (§2) — une fois, avec `gh` authentifié.
3. À partir de là seulement : tous les déploiements suivants passent par
   `gh workflow run` piloté par l'assistant (§3), plus jamais par une
   commande AWS tapée à la main.
