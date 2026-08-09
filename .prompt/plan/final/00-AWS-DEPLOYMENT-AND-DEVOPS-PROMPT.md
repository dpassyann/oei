# Prompt Claude Code — OEI AWS Deployment & DevOps Readiness

## Contexte
Le provider retenu est **AWS**. La base de données de référence est **PostgreSQL**. Tous les composants sont conteneurisés : frontend, backend Spring Boot, Keycloak, PostgreSQL V1, MinIO/Versity V1, workers futurs. Le paiement est externalisé.

## Cible V1
```text
Route 53
  -> CloudFront + WAF
  -> EC2 Linux
  -> k3s / Traefik
      -> frontend
      -> backend
      -> keycloak
      -> postgresql
      -> minio/versity
```
Sauvegardes hors VM sur S3.

## Objectif
Préparer le code et l'infrastructure pour un déploiement simple, sécurisé et migrable vers EKS/ECS, RDS PostgreSQL, S3, ALB, Secrets Manager et Terraform.

## Docker
Frontend : build multi-stage Angular -> Nginx unprivileged, non-root, healthcheck, headers sécurité, cache assets, config runtime, ARM64/AMD64.

Backend : Java 25, JRE runtime, layered jar, non-root, Actuator liveness/readiness, graceful shutdown, mémoire bornée, aucun secret, multi-arch.

Keycloak : image officielle ou dérivée uniquement pour thème/providers, health/metrics, configuration par variables.

PostgreSQL : volume persistant, aucune donnée dans l'image, bases `oei` et `keycloak`, users `oei_app` et `keycloak_app`, Flyway côté backend.

MinIO/Versity : cacher derrière `DocumentStoragePort` avec `MinioS3Adapter` et `AwsS3Adapter`.

## ECR
Repositories :
```text
oei/frontend
oei/backend
oei/keycloak
oei/workers/*
```
Tags immuables `vX.Y.Z` et `sha-...`. Interdire `latest` en production.

## Kubernetes
Namespaces : `oei-app`, `oei-auth`, `oei-data`, `oei-system`.
Chaque pod : requests/limits, probes, `runAsNonRoot`, `allowPrivilegeEscalation=false`, capabilities minimales.

## Configuration
Aucun secret dans Git ou les images. Préparer SOPS/age ou Sealed Secrets en V1 et migration future vers AWS Secrets Manager/SSM Parameter Store.

## AWS Identity
Pas d'AWS access key hardcodée. Utiliser instance profile/IAM role, permissions minimales S3/ECR/CloudWatch, GitHub OIDC pour CI/CD.

## CI/CD
GitHub Actions : tests -> build -> SBOM -> CVE scan -> Docker multi-arch -> ECR -> deploy Helm/Kustomize -> smoke tests -> rollback.

## Edge
Préparer CloudFront/WAF, `X-Forwarded-*`, trusted proxy, CORS strict, CSP, HSTS, cookies Secure/SameSite.

Hostnames :
`oei.global`, `www.oei.global`, `api.oei.global`, `auth.oei.global`, `members.oei.global`, `admin.oei.global`.

## Origin protection
Prévoir filtrage réseau + secret header origin contrôlé par Traefik. Documenter ses limites et la migration future vers origine privée/ALB.

## PostgreSQL Backup
CronJob `pg_dump -> gzip -> S3`. Rétention 7 daily / 4 weekly / 12 monthly. Documenter restore et test mensuel.

## Object storage
MinIO/Versity + PVC en V1, backup S3. Migration future par `OBJECT_STORAGE_PROVIDER=aws-s3` sans modifier le domaine.

## Logs
JSON stdout avec correlationId/requestId. Ne jamais logger tokens, mots de passe, CV complets ou secrets PSP.

## Mail
Créer `MailPort` avec `SMTPAdapter` puis futur `SESAdapter`.

## Ports cloud
Créer dans le domaine/application :
`DocumentStoragePort`, `MailPort`, `PaymentPort`, `IdentityAdministrationPort`, `NotificationPort`, `AuditPort`.

## Future AWS
```text
EC2/k3s -> EKS/ECS
PostgreSQL pod -> RDS PostgreSQL
MinIO -> S3
Traefik -> ALB
Secrets -> Secrets Manager
single node -> Multi-AZ
manual -> Terraform + GitOps
```

## Livrables
Créer `docs/deployment/` avec : AWS-ARCHITECTURE.md, DOCKER-READINESS.md, K3S-DEPLOYMENT.md, ECR-PIPELINE.md, POSTGRES-BACKUP-RESTORE.md, S3-MIGRATION.md, SECURITY-HARDENING.md, CLOUD-PORTS-AND-ADAPTERS.md, PROD-CONFIGURATION.md, FUTURE-TERRAFORM.md.
