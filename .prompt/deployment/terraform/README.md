# Terraform — Infrastructure AWS OEI (theitorder.global)

Ce dossier automatise l'**infrastructure** décrite pas-à-pas dans
[`../deploiement-aws.md`](../deploiement-aws.md). Il ne couvre PAS le
déploiement applicatif (build/push des images Docker, `docker compose up`,
import du royaume Keycloak, publication du build Angular) : ces étapes
restent manuelles/scriptées et documentées dans le manuel (§8, §9, §10, §11.3).

Périmètre couvert par ce Terraform :

- VPC/subnet par défaut de la région (pas de VPC dédié pour une seule instance).
- Security Group EC2 (443/80 publics, SSH restreint).
- Rôle IAM + Instance Profile EC2 en moindre privilège (S3 + SSM + CloudWatch).
- Instance EC2 `t4g.large` (AMI Amazon Linux 2023 ARM64 la plus récente),
  volume racine EBS chiffré, Elastic IP, user-data Docker + Compose.
- 4 buckets S3 : `oei-public`, `oei-membership`, `oei-backups`, `oei-web-static`.
- Distribution CloudFront + OAC devant `oei-web-static`, certificat ACM
  (us-east-1) validé par DNS.
- Enregistrements Route 53 (`api.`, `auth.`, apex, `www.`) dans une hosted
  zone **existante**.
- Budget AWS avec alertes email à 80 %/100 %.
- Backend d'état Terraform distant S3 + DynamoDB (`backend.tf`).
- Fédération d'identité OIDC GitHub Actions : provider OIDC + rôle IAM
  scopé + policy moindre-privilège (`github_oidc.tf`), utilisés par
  `.github/workflows/deploy-infra.yml` et `deploy-app.yml`.
- Dépôt ECR unique `oei-backend` (`ecr.tf`) pour l'image du backend.

Le pilotage CI/CD (workflows GitHub Actions, bootstrap manuel unique) est
documenté dans
[`../pipeline-github-actions.md`](../pipeline-github-actions.md).

## Prérequis

1. Un compte AWS avec des credentials configurés localement (`aws configure`
   ou variables `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/`AWS_SESSION_TOKEN`),
   utilisateur IAM dédié (pas root), cf. manuel §3.2.
2. Le domaine `theitorder.global` **déjà déposé** (Route 53 Domains ou
   registrar tiers) et une **hosted zone Route 53 déjà créée manuellement**
   pour ce domaine (manuel §2) — Terraform ne peut pas acheter un nom de
   domaine, il se contente de référencer la zone existante via une data
   source (`data.aws_route53_zone.primary`).
3. Terraform CLI installé (>= 1.7, voir `versions.tf`).
4. Une paire de clés SSH générée localement, dont on va importer la clé
   **publique** (jamais la clé privée) :
   ```bash
   ssh-keygen -t ed25519 -f ./oei-prod-key -C "oei-prod"
   ```

> Note environnement de développement : dans le sandbox où ce Terraform a été
> écrit, le binaire `terraform` n'était pas installable (accès réseau/FS
> restreint), donc `terraform fmt`/`validate` n'ont pas pu être exécutés ici.
> Faites tourner les commandes de la section "Vérification" avant tout
> `apply` réel.

## Variables SANS valeur par défaut — à renseigner impérativement

Ces variables n'ont volontairement **aucune valeur par défaut** ; `terraform
plan`/`apply` échoueront tant qu'elles ne sont pas fournies (via
`terraform.tfvars`, `-var`, ou `TF_VAR_*`) :

| Variable | Pourquoi pas de défaut |
|---|---|
| `domain_name` | Éviter d'appliquer silencieusement sur le mauvais domaine (valeur attendue : `theitorder.global`). |
| `ssh_allowed_cidr` | Ne doit **jamais** valoir `0.0.0.0/0` par défaut ; une validation Terraform le refuse explicitement. |
| `ssh_public_key` | Doit être la vraie clé publique de l'opérateur, jamais une clé d'exemple partagée. |
| `budget_alert_email` | Les alertes de coût doivent arriver sur une vraie boîte surveillée. |
| `monthly_budget_amount_usd` | Choix de seuil conscient (le manuel §15 estime ~55-70 USD/mois et recommande 80 USD comme seuil). |

Toutes les autres variables (`aws_region`, `instance_type`,
`root_volume_size_gb`, noms de buckets, `ssm_parameter_prefix`,
`common_tags`, etc.) ont un défaut déjà aligné sur le manuel — à ajuster
seulement si besoin (voir `variables.tf` et `terraform.tfvars.example`).

## Commandes

```bash
cd .prompt/deployment/terraform
cp terraform.tfvars.example terraform.tfvars
# éditer terraform.tfvars avec vos valeurs réelles (ne JAMAIS commiter ce fichier)

terraform init
terraform plan
terraform apply
```

Après un premier `apply` réussi :
- reporter `output "ec2_public_ip"` là où c'est utile (scripts de déploiement,
  inventaire) ;
- suivre le manuel §8-§11.3 pour construire/pousser les images Docker,
  déployer `docker-compose.prod.yml` sur l'instance, et publier le build
  Angular sur `oei-web-static` ;
- acheter séparément la Reserved Instance (`aws ec2
  purchase-reserved-instances-offering ...`, manuel §4.3) — c'est un
  engagement de facturation, pas une ressource Terraform, il n'y a rien à
  "provisionner" pour ça au-delà de l'instance déjà lancée par ce code.

## Gestion du state

Le state Terraform est désormais déclaré en backend distant **S3 + DynamoDB**
(`backend.tf`, bucket `oei-terraform-state`, table de verrouillage
`oei-terraform-locks`, région `eu-west-3`) — nécessaire pour que le pipeline
GitHub Actions (`deploy-infra.yml`) et un opérateur humain partagent le même
state, avec verrouillage contre les applies concurrents.

Le state a été créé **localement** par un agent précédent (`terraform.tfstate`
dans ce dossier, ignoré par `.gitignore`). Le bucket/table du backend distant
ne sont volontairement **pas** des ressources de ce Terraform (un backend ne
peut pas bootstrapper le stockage dont il dépend lui-même) : leur création et
la migration du state local vers S3 font partie du **bootstrap manuel unique**
documenté dans
[`../pipeline-github-actions.md`](../pipeline-github-actions.md) — à exécuter
une seule fois, depuis la machine de l'opérateur, avec ses propres
identifiants AWS (`aws s3api create-bucket` / `aws dynamodb create-table` /
`terraform init -migrate-state`).

Ce même bootstrap manuel effectue aussi le tout premier `terraform apply` en
local, pour créer le rôle IAM OIDC (`github_oidc.tf`) que GitHub Actions
utilisera ensuite pour tous les déploiements suivants — voir
`pipeline-github-actions.md` pour l'ordre exact des commandes.

## Vérification

```bash
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

`validate` fonctionne sans vraies credentials AWS (il vérifie la syntaxe et
les références internes, pas l'état réel du compte).

## Basculer vers un VPC dédié plus tard

Ce Terraform réutilise le VPC par défaut de la région (`data "aws_vpc"
"default"` dans `data.tf`) — suffisant pour une seule instance sans besoin
d'isolation réseau avancée. Pour migrer vers un VPC dédié :

1. Ajoutez des ressources `aws_vpc`, `aws_subnet` (public), `aws_internet_gateway`
   et une table de routage associée.
2. Renseignez les variables `vpc_id` et `subnet_id` avec les IDs du nouveau
   VPC/subnet — tout le reste du code (Security Group, instance EC2, IAM)
   fonctionne sans modification puisqu'il consomme `local.vpc_id` /
   `local.subnet_id`, jamais le VPC par défaut directement.
3. Un NAT Gateway n'est PAS nécessaire ici : l'instance a une IP publique
   directe (Elastic IP) en subnet public, cf. manuel §15 — n'en ajoutez un
   que si vous introduisez des ressources sans IP publique ayant besoin de
   sortir vers Internet.

## Décisions prises face aux ambiguïtés du manuel

- **Taille du volume racine EBS** : le manuel utilise 30 Go `gp3` dans son
  exemple de commande (§4.4) alors que la consigne de cette tâche suggérait
  "40-60 Go". Le manuel fait foi : `root_volume_size_gb` a pour défaut `30`,
  librement ajustable.
- **Second Security Group "interne"** : non créé. Un Security Group AWS
  filtre au niveau de l'ENI EC2, il n'a aucune visibilité sur le réseau
  Docker interne `oei-net` — modéliser un SG "accès interne uniquement" pour
  Postgres/Keycloak serait un no-op côté AWS. La défense en profondeur pour
  cette frontière est `ufw` + la chaîne `DOCKER-USER` sur l'hôte
  (manuel §5.2, §12.1), hors périmètre Terraform.
- **AMI** : résolue dynamiquement via le paramètre SSM public
  `/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64`
  (recommandé par le manuel §4.4), jamais un ID d'AMI figé en dur.
- **Chiffrement S3** : SSE-S3 (`AES256`) sur les 4 buckets, cohérent avec la
  configuration explicite du manuel (§6.4) pour `oei-public`/`oei-membership`/
  `oei-backups` ; étendu par cohérence à `oei-web-static` (non explicitement
  couvert par le manuel pour ce bucket, mais aucune raison de l'exempter).
- **Versioning S3** : activé sur les 4 buckets pour la même raison de
  cohérence (le manuel ne le précise explicitement que pour les 3 premiers).
- **Certificat ACM** : demandé via le provider aliasé `aws.us_east_1`
  (contrainte CloudFront), avec validation DNS automatisée par des
  enregistrements Route 53 gérés par Terraform (`aws_acm_certificate_validation`),
  au lieu de l'étape manuelle décrite au §11.2 du manuel.
- **Instance Reserved** : volontairement non modélisée en ressource
  Terraform — c'est un engagement de facturation sur un instance-type déjà
  lancé, pas une ressource à créer (voir commentaire dans `ec2.tf`).
- **Hosted zone Route 53** : toujours référencée en data source
  (`data.aws_route53_zone.primary`), jamais créée par ce Terraform,
  conformément à la contrainte "un domaine ne s'achète pas via Terraform".

## Rappel important

Ce Terraform s'arrête à l'infrastructure (réseau, calcul, stockage, DNS,
IAM, budget). Le déploiement applicatif — construction des images Docker
(`infra/docker/*.Dockerfile`), authentification ECR, dépôt des secrets dans
SSM Parameter Store, `docker-compose.prod.yml`, Caddy/TLS, publication du
build Angular sur `oei-web-static`, sauvegardes `pg_dump`/DLM, durcissement
système (`ufw`, `fail2ban`) — reste décrit et exécuté séparément, en suivant
[`../deploiement-aws.md`](../deploiement-aws.md).
