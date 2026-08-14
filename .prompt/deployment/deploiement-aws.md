# Manuel de déploiement AWS — OEI (theitorder.global)

> Document de référence pour déployer en production, sur un unique serveur AWS, la plateforme OEI :
> frontend Angular 22 (`frontend/oei-web`), backend Spring Boot 4.1.0 / Java 25 multi-module
> (`backend/`, module exécutable `application-web`), Keycloak 25 (import de royaume) et
> PostgreSQL 17, actuellement orchestrés en local par `infra/docker-compose.yml`.
>
> **Périmètre imposé** : un seul serveur Linux en instance réservée (Reserved Instance),
> **pas de service d'orchestration managé** (ni ECS, ni EKS, ni Elastic Beanstalk, ni App
> Runner) — tout tourne en Docker Compose directement sur l'instance, géré à la main ou par
> scripts. Le nom de domaine public retenu est **`theitorder.global`** (choix déjà tranché,
> ne pas le remettre en question).

---

## Sommaire

1. [Vue d'ensemble de l'architecture cible](#1-vue-densemble-de-larchitecture-cible)
2. [Achat et configuration du nom de domaine](#2-achat-et-configuration-du-nom-de-domaine)
3. [Préparation du compte AWS](#3-préparation-du-compte-aws)
4. [Choix et provisioning de l'instance EC2](#4-choix-et-provisioning-de-linstance-ec2)
5. [Réseau, Security Groups et durcissement SSH](#5-réseau-security-groups-et-durcissement-ssh)
6. [Remplacement de MinIO par S3 (stockage objet)](#6-remplacement-de-minio-par-s3-stockage-objet)
7. [Secrets et configuration (SSM Parameter Store)](#7-secrets-et-configuration-ssm-parameter-store)
8. [Construction des images Docker multi-étages](#8-construction-des-images-docker-multi-étages)
9. [Composition de production (`docker-compose.prod.yml`) et TLS](#9-composition-de-production-docker-composeprodyml-et-tls)
10. [Déploiement initial sur le serveur](#10-déploiement-initial-sur-le-serveur)
11. [CDN : CloudFront + S3 pour les assets Angular](#11-cdn--cloudfront--s3-pour-les-assets-angular)
12. [Durcissement système (ufw, fail2ban, mises à jour)](#12-durcissement-système-ufw-fail2ban-mises-à-jour)
13. [Sauvegardes et reprise après sinistre](#13-sauvegardes-et-reprise-après-sinistre)
14. [Supervision, logs et alerting](#14-supervision-logs-et-alerting)
15. [Estimation de coût mensuel détaillée](#15-estimation-de-coût-mensuel-détaillée)
16. [Check-list de mise en production](#16-check-list-de-mise-en-production)

---

## 1. Vue d'ensemble de l'architecture cible

```
                              ┌────────────────────────────────────────┐
                              │            Route 53 (DNS)               │
                              │  theitorder.global / www / api / auth   │
                              └───────────────┬──────────────────────────┘
                                              │
                 ┌────────────────────────────┼─────────────────────────────┐
                 │                            │                             │
                 ▼                            ▼                             ▼
     ┌─────────────────────┐      ┌───────────────────────┐      ┌────────────────────┐
     │ CloudFront (CDN)     │      │ EC2 t4g.large (Reserved)│    │ ACM / Route 53      │
     │ www.theitorder.global│      │ api.theitorder.global   │    │ (validation DNS)    │
     │  ↳ origin S3 statique│      │ auth.theitorder.global  │    └────────────────────┘
     └──────────┬───────────┘      │                          │
                │                  │  Docker Compose (prod) :  │
                ▼                  │  ┌────────────────────┐  │
     ┌─────────────────────┐      │  │ Caddy (80/443)      │  │  ← seul point d'entrée
     │ S3 : oei-web-static  │      │  │  reverse-proxy TLS  │  │    réseau exposé
     │ (build Angular)      │      │  └─────────┬──────────┘  │
     └─────────────────────┘      │            │              │
                                  │  ┌──────────┴──────────┐  │
                                  │  │ backend (Spring Boot)│  │  réseau Docker interne
                                  │  │ keycloak (25)         │  │  (oei-net), AUCUN port
                                  │  │ postgres (17)         │  │  publié vers l'hôte/Internet
                                  │  └──────────────────────┘  │
                                  └───────────────┬─────────────┘
                                                  │ rôle IAM (Instance Profile)
                                                  ▼
                              ┌───────────────────────────────────────┐
                              │ S3 : oei-public / oei-membership       │
                              │ SSM Parameter Store (secrets)          │
                              │ CloudWatch (logs/metrics)               │
                              └───────────────────────────────────────┘
```

Décisions structurantes prises dans ce manuel (et pourquoi) :

| Sujet | Décision | Justification |
|---|---|---|
| Domaine | `theitorder.global` (déjà choisi) | Cohérent avec l'ambition internationale du projet. |
| Registrar | Route 53 Domains **si** `.global` y est proposé, sinon registrar tiers + délégation NS | Le TLD `.global` n'est pas toujours listé chez Route 53 Domains ; à vérifier au moment de l'achat (§2). |
| Orchestration | Docker Compose sur EC2, **aucun** service managé de conteneurs | Contrainte explicite du porteur du projet. |
| Instance | `t4g.large` (Graviton/ARM, 2 vCPU, 8 Go RAM) en Reserved Instance | Voir §4 — "t8" n'existe pas chez AWS ; ARM est totalement supporté par Java 25 et Angular/Node ; `t4g.medium` (4 Go) est trop juste avec Keycloak + Postgres + JVM simultanés. |
| Stockage objet | S3 (`oei-public`, `oei-membership`) + IAM Instance Profile, **MinIO retiré en prod** | Pas de service supplémentaire à faire tourner/mémoire à consommer sur le serveur ; S3 est managé, durable (11 x 9), facturé à l'usage. |
| Frontend statique | Build Angular poussé sur S3, servi par CloudFront (CDN mondial, HTTPS, cache) | Le contrainte de coût/UX impose de ne pas faire porter le trafic statique par le serveur unique ; latence réduite pour les utilisateurs hors Europe. |
| Reverse-proxy / TLS | Caddy (image Docker) plutôt que certbot manuel | Renouvellement Let's Encrypt automatique intégré, un seul conteneur, pas de cron à maintenir — le plus simple à opérer sans "service manager". |
| Secrets | AWS SSM Parameter Store (Standard, gratuit) | Coffre-fort, pas un orchestrateur — autorisé par la contrainte du porteur du projet. |
| Sécurité réseau | Security Group (443/80 ouverts, SSH restreint) + `ufw` en complément défense-en-profondeur | Le SG est la barrière principale (niveau AWS, avant même le paquet réseau) ; `ufw` protège en cas de mauvaise configuration locale ou de service qui s'auto-expose sur un port. |

---

## 2. Achat et configuration du nom de domaine

### 2.1 Vérifier la disponibilité du TLD `.global` sur Route 53 Domains

Le TLD `.global` fait partie des TLD génériques restreints par Identity Digital ; sa
disponibilité sur **Route 53 Domains** n'est pas garantie (Route 53 Domains ne revend pas
tous les TLD existants). Vérifier avant tout achat :

```bash
aws route53domains check-domain-availability \
  --domain-name theitorder.global \
  --region us-east-1
```

- Si la réponse est `AVAILABLE` → acheter directement via Route 53 Domains (§2.2).
- Si la commande retourne une erreur du type `UnsupportedTLD` ou le domaine n'apparaît pas
  disponible → utiliser un registrar tiers supportant `.global` (ex. Identity Digital
  Registry via des registrars comme Gandi, Namecheap ou OVH) puis déléguer les serveurs de
  noms (NS) vers une hosted zone Route 53 (§2.3). C'est le chemin le plus probable pour un
  TLD `.global`, à traiter comme cas nominal dans ce manuel.

### 2.2 Cas A — Achat direct via Route 53 Domains (si disponible)

```bash
aws route53domains register-domain \
  --domain-name theitorder.global \
  --duration-in-years 1 \
  --auto-renew \
  --admin-contact file://contact-admin.json \
  --registrant-contact file://contact-registrant.json \
  --tech-contact file://contact-tech.json \
  --region us-east-1
```

Route 53 Domains crée automatiquement la hosted zone associée. Passer directement à
l'étape 2.4 (enregistrements DNS).

### 2.3 Cas B — Achat chez un registrar tiers + délégation vers Route 53

1. Acheter `theitorder.global` chez le registrar tiers (interface web du registrar).
2. Créer la hosted zone Route 53 dans le compte AWS :

```bash
aws route53 create-hosted-zone \
  --name theitorder.global \
  --caller-reference "oei-init-$(date +%s)" \
  --hosted-zone-config Comment="Zone DNS publique OEI"
```

3. Récupérer les 4 serveurs de noms (NS) attribués :

```bash
aws route53 get-hosted-zone --id <ID_ZONE_RETOURNE_ETAPE_2> \
  --query "DelegationSet.NameServers"
```

4. Dans l'interface du registrar tiers, remplacer les NS par défaut par les 4 NS Route 53
   ci-dessus (section "Nameservers"/"DNS Servers" de la fiche domaine). La propagation
   prend de quelques minutes à 48h.
5. Vérifier la délégation une fois propagée :

```bash
dig NS theitorder.global +short
```

### 2.4 Enregistrements DNS

Les enregistrements finaux (IP EC2, distribution CloudFront) ne sont connus qu'après les
étapes 4 et 11 ; créer dès maintenant le squelette, à compléter ensuite :

| Nom | Type | Cible | Usage |
|---|---|---|---|
| `theitorder.global` | A | (à créer en §11, alias CloudFront) | Site public (Angular) |
| `www.theitorder.global` | CNAME/A | alias vers `theitorder.global` | Redirection vers l'apex |
| `api.theitorder.global` | A | IP publique Elastic IP de l'instance (§4) | Backend Spring Boot |
| `auth.theitorder.global` | A | même IP Elastic IP | Keycloak (reverse-proxy Caddy) |

```bash
# Exemple pour api.theitorder.global une fois l'Elastic IP connue (§4.4)
aws route53 change-resource-record-sets \
  --hosted-zone-id <ID_ZONE> \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.theitorder.global",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "<ELASTIC_IP>"}]
      }
    }]
  }'
```

Répéter pour `auth.theitorder.global` (même IP, Caddy fait le routage par nom d'hôte).

---

## 3. Préparation du compte AWS

### 3.1 Région

Choisir une région proche du cœur d'audience initiale tout en restant compatible Graviton
et avec tous les services utilisés (Route 53 Domains n'existe qu'en `us-east-1` pour les
appels API, mais les ressources applicatives peuvent être ailleurs). Ce manuel prend
`eu-west-3` (Paris) comme région applicative de référence — à ajuster si l'audience cible
est majoritairement ailleurs.

### 3.2 Utilisateur IAM d'administration (pas root)

Ne jamais utiliser les identifiants root AWS au quotidien.

```bash
aws iam create-user --user-name oei-admin
aws iam attach-user-policy --user-name oei-admin \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
aws iam create-access-key --user-name oei-admin
# Configurer un profil CLI nommé dédié :
aws configure --profile oei-admin
```

Activer la MFA sur ce compte IAM (console AWS → IAM → Security credentials → Assign MFA
device) avant toute autre opération.

### 3.3 AWS Budgets et alertes de coût

```bash
aws budgets create-budget \
  --account-id <ACCOUNT_ID> \
  --budget '{
    "BudgetName": "oei-monthly-budget",
    "BudgetLimit": {"Amount": "80", "Unit": "USD"},
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }' \
  --notifications-with-subscribers '[{
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [{"SubscriptionType": "EMAIL", "Address": "ydeungoue@pictet.com"}]
  }, {
    "Notification": {
      "NotificationType": "FORECASTED",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 100,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [{"SubscriptionType": "EMAIL", "Address": "ydeungoue@pictet.com"}]
  }]'
```

Seuil de 80 USD/mois cohérent avec l'estimation du §15 (marge de sécurité incluse).

---

## 4. Choix et provisioning de l'instance EC2

### 4.1 À propos du type d'instance "t8"

**Il n'existe aucune famille d'instance EC2 nommée `t8` chez AWS** — les familles brûlables
("burstable") actuelles sont `t2`, `t3`, `t3a` et `t4g` (la plus récente, sur processeur
Graviton2/ARM). Il n'y a pas de feuille de route publique AWS pour une famille `t5`/`t6`/`t7`/`t8`
à ce jour. La confusion vient probablement du nombre "T4g" (le "4" désignant la génération,
"g" pour Graviton) — c'est la famille recommandée ici.

### 4.2 Choix retenu : `t4g.large`

| Critère | `t4g.medium` | `t4g.large` (retenu) |
|---|---|---|
| vCPU | 2 | 2 |
| RAM | 4 Go | **8 Go** |
| Architecture | ARM64 (Graviton2) | ARM64 (Graviton2) |
| Crédits CPU burstable | Oui (baseline 20 %) | Oui (baseline 30 %) |
| Coût on-demand (eu-west-3, ordre de grandeur) | ~0,0362 USD/h | ~0,0723 USD/h |

Budget mémoire approximatif à chaud (tous conteneurs démarrés simultanément) :

| Service | RAM (limite recommandée) | Remarque |
|---|---|---|
| PostgreSQL 17 | ~512 Mo – 1 Go | `shared_buffers` par défaut modeste, base de taille modérée |
| Keycloak 25 (JVM) | ~768 Mo – 1 Go | JVM + cache de royaume, `start` (pas `start-dev`) en prod |
| Backend Spring Boot (JVM, Java 25) | ~768 Mo – 1 Go | `-Xmx768m` recommandé, JIT + métaspace inclus |
| Caddy (reverse-proxy) | ~50 Mo | Empreinte très faible |
| Docker Engine + OS (Amazon Linux 2023) | ~500 Mo – 700 Mo | Overhead système incompressible |
| **Total estimé** | **~2,6 – 3,8 Go** | |
| Marge tampon (pics GC, builds, mises à jour) | ~2 – 3 Go | |

Sur `t4g.medium` (4 Go), le total tient en théorie mais **sans aucune marge** dès qu'un pic
GC Keycloak+backend coïncide avec un build ou un `docker compose pull` — risque d'OOM
killer côté noyau. `t4g.large` (8 Go) laisse une marge confortable (~4 Go de libre) pour la
croissance du royaume Keycloak, la montée en charge du backend et les opérations de
maintenance (déploiement bleu/vert local, dump Postgres en cours, etc.), pour un delta de
coût modéré (voir §15). C'est le choix retenu.

Le frontend Angular, lui, **n'est pas servi depuis cette instance** en production (voir
§11 — CloudFront/S3), ce qui libère d'autant la charge CPU/mémoire du serveur unique.

### 4.3 Instance réservée (Reserved Instance)

Comparatif on-demand vs Reserved Instance (ordre de grandeur, `t4g.large`, `eu-west-3`,
Linux) :

| Option | Coût horaire approx. | Coût mensuel approx. (730h) | Coût annuel approx. |
|---|---|---|---|
| On-Demand | ~0,0723 USD/h | ~53 USD/mois | ~635 USD/an |
| Reserved 1 an, No Upfront | ~0,051 USD/h équivalent | ~37 USD/mois | ~445 USD/an (~30 % d'économie) |
| Reserved 1 an, Partial Upfront | upfront ~185 USD + ~0,033 USD/h | ~24 USD/mois + amorti | ~465 USD/an tout compris (~27 % d'économie, upfront plus élevé) |

**Recommandation** : Reserved Instance **1 an, No Upfront** — pas de sortie de trésorerie
immédiate, économie substantielle vs on-demand, et engagement d'un an cohérent avec un
projet en phase de lancement (pas encore assez de recul pour s'engager 3 ans).

```bash
# Recherche des offres Reserved Instance disponibles
aws ec2 describe-reserved-instances-offerings \
  --instance-type t4g.large \
  --product-description "Linux/UNIX" \
  --offering-class standard \
  --offering-type "No Upfront" \
  --region eu-west-3

# Achat (remplacer OFFERING_ID par l'ID retourné ci-dessus)
aws ec2 purchase-reserved-instances-offering \
  --reserved-instances-offering-id <OFFERING_ID> \
  --instance-count 1 \
  --region eu-west-3
```

> Une Reserved Instance est un **engagement de facturation**, pas un provisioning : il faut
> ensuite lancer une instance `t4g.large` normalement (§4.4) dans la même région/AZ/type
> pour que la réduction s'applique automatiquement.

### 4.4 Lancement de l'instance EC2

1. Créer une paire de clés SSH dédiée (aucune authentification par mot de passe) :

```bash
aws ec2 create-key-pair --key-name oei-prod-key \
  --query "KeyMaterial" --output text > oei-prod-key.pem
chmod 400 oei-prod-key.pem
```

2. Créer le rôle IAM et l'Instance Profile (détaillé §5.4/§6.2), puis lancer l'instance :

```bash
aws ec2 run-instances \
  --image-id ami-XXXXXXXXXXXXXXXXX \
  --instance-type t4g.large \
  --key-name oei-prod-key \
  --security-group-ids sg-XXXXXXXXXXXXXXXXX \
  --subnet-id subnet-XXXXXXXXXXXXXXXXX \
  --iam-instance-profile Name=oei-ec2-instance-profile \
  --block-device-mappings '[{
    "DeviceName": "/dev/xvda",
    "Ebs": {"VolumeSize": 30, "VolumeType": "gp3", "Encrypted": true, "DeleteOnTermination": false}
  }]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=oei-prod}]' \
  --region eu-west-3
```

Points clés :
- **AMI Amazon Linux 2023 ARM64** (`ami-...`, à récupérer via
  `aws ssm get-parameters --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64`)
  — compatible Graviton, gérée par AWS (patches sécurité réguliers).
  30 Go de disque `gp3`, largement suffisant (images Docker + volumes Postgres/Keycloak).
- `Encrypted: true` → chiffrement EBS au repos (voir §5.5).
- `DeleteOnTermination: false` → le volume racine survit à une éventuelle suppression
  accidentelle de l'instance (protection supplémentaire).
- `iam-instance-profile` → rôle scopé S3 + SSM + CloudWatch uniquement (§5.4).

3. Allouer et associer une Elastic IP (IP publique fixe, indispensable pour le DNS) :

```bash
aws ec2 allocate-address --domain vpc --region eu-west-3
aws ec2 associate-address --instance-id <INSTANCE_ID> \
  --allocation-id <ALLOCATION_ID> --region eu-west-3
```

Reporter cette Elastic IP dans les enregistrements DNS `api.theitorder.global` et
`auth.theitorder.global` (§2.4).

---

## 5. Réseau, Security Groups et durcissement SSH

### 5.1 Security Group applicatif

```bash
aws ec2 create-security-group \
  --group-name oei-prod-sg \
  --description "SG serveur unique OEI prod" \
  --vpc-id <VPC_ID> --region eu-west-3

# HTTPS ouvert au monde
aws ec2 authorize-security-group-ingress --group-id <SG_ID> \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# HTTP ouvert au monde (redirection 301 vers HTTPS gérée par Caddy, + défi ACME HTTP-01)
aws ec2 authorize-security-group-ingress --group-id <SG_ID> \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

# SSH restreint à l'IP publique de l'administrateur uniquement (remplacer par la vraie IP/32)
aws ec2 authorize-security-group-ingress --group-id <SG_ID> \
  --protocol tcp --port 22 --cidr <IP_ADMIN>/32
```

**Aucune autre règle entrante** : ni 5432 (Postgres), ni 8080/8081 (Keycloak), ni 8443 ne
sont ouverts sur ce Security Group — ces services ne sont accessibles que via le réseau
Docker interne (`oei-net`), jamais publiés vers l'hôte (voir `docker-compose.prod.yml`,
§9 — aucun `ports:` pour `postgres`, `keycloak`, `backend`).

### 5.2 Pourquoi un Security Group suffit (et ce qu'`ufw` ajoute)

Le Security Group AWS filtre déjà tout le trafic *avant* qu'il n'atteigne l'interface
réseau de l'instance (niveau hyperviseur) : c'est la barrière principale et suffisante pour
bloquer tout accès entrant non désiré depuis Internet. `ufw` (Uncomplicated Firewall,
niveau noyau Linux, iptables) est ajouté en **défense en profondeur** (§12) pour se prémunir
d'une erreur de configuration Docker qui publierait accidentellement un port sur `0.0.0.0`
sans qu'on l'ait remonté dans le Security Group — Docker manipule directement iptables et
peut contourner certains pare-feux mal configurés, `ufw` bien configuré avec
`DOCKER-USER` referme ce trou (détail §12.1).

### 5.3 Accès SSH par clé uniquement, utilisateur non-root

Une fois connecté en `ec2-user` (AMI Amazon Linux) :

```bash
ssh -i oei-prod-key.pem ec2-user@<ELASTIC_IP>
```

1. Créer un utilisateur applicatif dédié, non-root, membre du groupe `docker` :

```bash
sudo useradd -m -s /bin/bash oei-deploy
sudo usermod -aG docker oei-deploy
sudo mkdir -p /home/oei-deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/oei-deploy/.ssh/
sudo chown -R oei-deploy:oei-deploy /home/oei-deploy/.ssh
sudo chmod 700 /home/oei-deploy/.ssh && sudo chmod 600 /home/oei-deploy/.ssh/authorized_keys
```

2. Désactiver l'authentification par mot de passe et le login SSH root direct
   (`/etc/ssh/sshd_config`) :

```
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

```bash
sudo systemctl restart sshd
```

3. Toutes les opérations de déploiement se font ensuite en tant que `oei-deploy` (jamais
   `root`, jamais `ec2-user` pour le quotidien).

### 5.4 Rôle IAM de l'instance (least-privilege)

Politique scopée strictement à S3 (buckets applicatifs), SSM (lecture des paramètres) et
CloudWatch (écriture de logs/métriques) — rien d'autre :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3AppBuckets",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::oei-public",
        "arn:aws:s3:::oei-public/*",
        "arn:aws:s3:::oei-membership",
        "arn:aws:s3:::oei-membership/*",
        "arn:aws:s3:::oei-backups",
        "arn:aws:s3:::oei-backups/*"
      ]
    },
    {
      "Sid": "SSMParameterRead",
      "Effect": "Allow",
      "Action": ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"],
      "Resource": "arn:aws:ssm:eu-west-3:*:parameter/oei/*"
    },
    {
      "Sid": "CloudWatchAgent",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    }
  ]
}
```

```bash
aws iam create-role --role-name oei-ec2-role \
  --assume-role-policy-document file://ec2-trust-policy.json
aws iam put-role-policy --role-name oei-ec2-role \
  --policy-name oei-least-privilege \
  --policy-document file://oei-ec2-policy.json
aws iam create-instance-profile --instance-profile-name oei-ec2-instance-profile
aws iam add-role-to-instance-profile \
  --instance-profile-name oei-ec2-instance-profile --role-name oei-ec2-role
```

Aucune clé d'accès IAM statique (`AWS_ACCESS_KEY_ID`/`SECRET`) n'est jamais déposée sur le
serveur : le SDK AWS (Java, CLI) utilise automatiquement les credentials temporaires fournis
par l'Instance Profile.

### 5.5 Chiffrement des volumes EBS

Déjà activé au lancement (`Encrypted: true`, §4.4). Vérification :

```bash
aws ec2 describe-volumes --filters "Name=attachment.instance-id,Values=<INSTANCE_ID>" \
  --query "Volumes[].{Id:VolumeId,Encrypted:Encrypted}"
```

Si le compte n'a pas le chiffrement EBS par défaut activé, l'activer une fois pour toutes :

```bash
aws ec2 enable-ebs-encryption-by-default --region eu-west-3
```

---

## 6. Remplacement de MinIO par S3 (stockage objet)

### 6.1 Pourquoi retirer MinIO en production

En local, `infra/docker-compose.yml` fait tourner `minio` + `minio-init` pour simuler S3
sans dépendance au cloud. En production sur AWS, faire tourner MinIO reviendrait à :

- consommer de la RAM/CPU supplémentaires sur un serveur déjà partagé entre Keycloak,
  Postgres et le backend (budget serré, §4.2) ;
- réinventer la durabilité/la haute disponibilité que S3 offre nativement (11 x 9 de
  durabilité annoncée), sans les répliques multi-AZ d'un vrai service managé ;
- gérer soi-même les sauvegardes d'un volume Docker (`minio-data`) au lieu de bénéficier du
  versioning et des lifecycle rules S3 natifs.

**Décision** : en production, `oei-public` et `oei-membership` sont deux vrais buckets S3,
accédés depuis le backend via le SDK AWS standard, authentifié uniquement par l'Instance
Profile EC2 (§5.4) — jamais de clé d'accès en dur dans la configuration applicative.

### 6.2 Création des buckets

```bash
aws s3api create-bucket \
  --bucket oei-public \
  --region eu-west-3 \
  --create-bucket-configuration LocationConstraint=eu-west-3

aws s3api create-bucket \
  --bucket oei-membership \
  --region eu-west-3 \
  --create-bucket-configuration LocationConstraint=eu-west-3

aws s3api create-bucket \
  --bucket oei-backups \
  --region eu-west-3 \
  --create-bucket-configuration LocationConstraint=eu-west-3
```

### 6.3 Politiques d'accès

`oei-public` : lecture anonyme des objets (équivalent du `mc anonymous set download`
local) via bucket policy, mais **jamais** de write public :

```bash
aws s3api put-bucket-policy --bucket oei-public --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadOnly",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::oei-public/*"
  }]
}'

aws s3api put-public-access-block --bucket oei-public --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false
```

`oei-membership` (documents sensibles/CV/cotisations) : **aucun accès public**, tout passe
par le backend authentifié :

```bash
aws s3api put-public-access-block --bucket oei-membership --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

`oei-backups` : idem, entièrement privé (voir §13).

### 6.4 Chiffrement par défaut et lifecycle

```bash
for BUCKET in oei-public oei-membership oei-backups; do
  aws s3api put-bucket-encryption --bucket "$BUCKET" --server-side-encryption-configuration '{
    "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
  }'
  aws s3api put-bucket-versioning --bucket "$BUCKET" --versioning-configuration Status=Enabled
done
```

Lifecycle : les vieux objets/logs migrent automatiquement vers des classes de stockage
moins chères (économie décrite au §15) :

```bash
aws s3api put-bucket-lifecycle-configuration --bucket oei-backups --lifecycle-configuration '{
  "Rules": [{
    "ID": "archive-old-backups",
    "Status": "Enabled",
    "Filter": {"Prefix": ""},
    "Transitions": [
      {"Days": 30, "StorageClass": "STANDARD_IA"},
      {"Days": 90, "StorageClass": "GLACIER_IR"}
    ],
    "Expiration": {"Days": 365}
  }]
}'
```

### 6.5 Configuration applicative (backend)

Le backend `application-web` remplace la configuration MinIO (endpoint local, clés
statiques) par le SDK AWS S3 standard, sans endpoint personnalisé ni clés statiques : il
suffit d'ajouter (ou de laisser Spring Cloud AWS / le SDK v2 résoudre automatiquement) la
chaîne de credentials par défaut, qui détecte l'Instance Profile EC2 sans configuration
supplémentaire. Variables d'environnement à définir dans `docker-compose.prod.yml` (§9) :

```yaml
OEI_S3_PUBLIC_BUCKET: oei-public
OEI_S3_MEMBERSHIP_BUCKET: oei-membership
AWS_REGION: eu-west-3
```

Aucune variable `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` n'est nécessaire ni souhaitable
sur ce serveur.

---

## 7. Secrets et configuration (SSM Parameter Store)

SSM Parameter Store est un coffre-fort de configuration/secrets, **pas** un service
d'orchestration — autorisé par la contrainte du porteur du projet. Choisi plutôt que
Secrets Manager pour ce projet : le tier **Standard** est gratuit (vs facturation au
secret + à l'appel pour Secrets Manager), largement suffisant pour la volumétrie de
secrets d'un site unique (mots de passe DB/Keycloak, clé publique JWT, etc.).

### 7.1 Dépôt des secrets

```bash
aws ssm put-parameter --name /oei/prod/OEI_USER --value "oei_admin" --type String
aws ssm put-parameter --name /oei/prod/OEI_PASSWORD --value "<mot-de-passe-fort-genere>" \
  --type SecureString --key-id alias/aws/ssm
aws ssm put-parameter --name /oei/prod/POSTGRES_DB --value "oei" --type String
aws ssm put-parameter --name /oei/prod/OEI_APP_PASSWORD --value "<mot-de-passe-fort-genere>" \
  --type SecureString --key-id alias/aws/ssm
aws ssm put-parameter --name /oei/prod/OEI_OIDC_ISSUER_URI \
  --value "https://auth.theitorder.global/realms/oei" --type String
```

### 7.2 Récupération au déploiement

Un script exécuté sur le serveur avant chaque `docker compose up` matérialise un fichier
`.env` local (jamais commité, permissions `600`) à partir de SSM :

```bash
#!/usr/bin/env bash
# infra/scripts/fetch-secrets.sh — exécuté sur le serveur, jamais committé dans git
set -euo pipefail

OUT_FILE="/home/oei-deploy/oei/.env"
umask 077

for NAME in OEI_USER OEI_PASSWORD POSTGRES_DB OEI_APP_PASSWORD OEI_OIDC_ISSUER_URI; do
  VALUE=$(aws ssm get-parameter --name "/oei/prod/${NAME}" --with-decryption \
    --query "Parameter.Value" --output text --region eu-west-3)
  echo "${NAME}=${VALUE}" >> "${OUT_FILE}.tmp"
done

mv "${OUT_FILE}.tmp" "${OUT_FILE}"
chmod 600 "${OUT_FILE}"
```

### 7.3 Rotation

Les secrets changent de valeur directement dans SSM (`put-parameter --overwrite`), puis un
redéploiement (`fetch-secrets.sh` + `docker compose up -d`) les propage. Documenter une
rotation trimestrielle a minima pour `OEI_PASSWORD`/`OEI_APP_PASSWORD`.

---

## 8. Construction des images Docker multi-étages

### 8.1 Backend `application-web` — Dockerfile multi-stage avec `layertools`

`spring-boot-maven-plugin` (déjà déclaré dans
`backend/application/web/pom.xml` avec le goal `repackage`) produit un jar exécutable
compatible `layertools`. On extrait le jar en couches (`dependencies`,
`spring-boot-loader`, `snapshot-dependencies`, `application`) puis on les `COPY` séparément
dans cet ordre : les dépendances (qui changent rarement) sont mises en cache Docker
indépendamment du code applicatif (qui change à chaque commit), ce qui accélère
drastiquement les rebuilds successifs.

```dockerfile
# infra/docker/backend.Dockerfile
# syntax=docker/dockerfile:1

########################
# Étage 1 : build Maven #
########################
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /workspace

# Cache des dépendances Maven : copier les pom.xml de tous les modules avant le code source
COPY pom.xml .
COPY domain/shared/pom.xml domain/shared/pom.xml
COPY domain/core/pom.xml domain/core/pom.xml
COPY infrastructure/security/pom.xml infrastructure/security/pom.xml
COPY infrastructure/persistence/pom.xml infrastructure/persistence/pom.xml
COPY infrastructure/wiring/pom.xml infrastructure/wiring/pom.xml
COPY application/pom.xml application/pom.xml
COPY application/web/pom.xml application/web/pom.xml
COPY test/architecture/pom.xml test/architecture/pom.xml
RUN mvn -B -q dependency:go-offline || true

# Code source complet, build réel
COPY domain domain
COPY infrastructure infrastructure
COPY application application
COPY test test
RUN mvn -B clean package -DskipTests -pl application/web -am

# Extraction en couches Spring Boot layertools
WORKDIR /workspace/extracted
RUN java -Djarmode=layertools \
    -jar /workspace/application/web/target/application-web-*-exec.jar extract

#################################
# Étage 2 : image d'exécution   #
#################################
# JRE minimale, compatible ARM64/Graviton (t4g.large)
FROM eclipse-temurin:25-jre-alpine AS runtime

RUN addgroup -S oei && adduser -S oei -G oei
WORKDIR /app
USER oei

# Ordre volontaire : dépendances (changent rarement) → loader → snapshot-dependencies
# → application (change à chaque commit), pour maximiser la réutilisation du cache Docker.
COPY --from=build --chown=oei:oei /workspace/extracted/dependencies/ ./
COPY --from=build --chown=oei:oei /workspace/extracted/spring-boot-loader/ ./
COPY --from=build --chown=oei:oei /workspace/extracted/snapshot-dependencies/ ./
COPY --from=build --chown=oei:oei /workspace/extracted/application/ ./

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx768m", "-XX:+UseSerialGC", "org.springframework.boot.loader.launch.JarLauncher"]
```

Remarques :
- `-XX:+UseSerialGC` : sur une instance à 2 vCPU, le GC série évite l'overhead de threads
  de GC parallèles concurrents avec les autres conteneurs (Keycloak, Postgres) — meilleur
  compromis mémoire/latence pour ce gabarit de serveur.
- `eclipse-temurin:25-jre-alpine` publie des variantes multi-arch (`amd64`/`arm64`) : le
  même Dockerfile fonctionne aussi bien en build local (Mac Apple Silicon/ARM ou Intel) que
  sur l'instance `t4g` (Graviton/ARM) en production, sans modification.

Construction et publication (registre au choix — Amazon ECR ou Docker Hub privé) :

```bash
docker build -f infra/docker/backend.Dockerfile -t oei-backend:latest \
  --platform linux/arm64 .

# Exemple avec Amazon ECR
aws ecr create-repository --repository-name oei-backend --region eu-west-3
aws ecr get-login-password --region eu-west-3 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com
docker tag oei-backend:latest <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/oei-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/oei-backend:latest
```

### 8.2 Frontend Angular — Dockerfile multi-stage (build) + Nginx

> **Nuance importante** : en production, le résultat du build Angular (`dist/`) est
> **poussé sur S3 et servi par CloudFront** (§11) — le conteneur Nginx ci-dessous n'est
> **pas déployé sur le serveur EC2 de production**. Il reste néanmoins documenté et
> construit ici, car :
> - il sert de parité locale/staging (preview d'une PR, environnement de recette) où l'on
>   veut un environnement Docker Compose complet sans dépendre d'AWS ;
> - l'étage 1 (build Node/pnpm) est exactement celui qui produit l'artefact `dist/`
>   synchronisé vers S3 en production (§11.3) — un seul Dockerfile sert donc les deux
>   usages, en n'exploitant que l'étage 1 en prod.

```dockerfile
# infra/docker/frontend.Dockerfile
# syntax=docker/dockerfile:1

######################################
# Étage 1 : build Angular (pnpm/Node) #
######################################
FROM node:22-alpine AS build
WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY frontend/oei-web/package.json frontend/oei-web/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY frontend/oei-web/ ./
# copy:content + ng build (configuration production par défaut, cf. angular.json)
RUN pnpm run build

#####################################################
# Étage 2 : Nginx — usage local/staging uniquement    #
#####################################################
FROM nginx:1.27-alpine AS runtime

COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
# Sortie du build Angular 22 (nouveau builder @angular/build), dossier "browser"
COPY --from=build /workspace/dist/oei-web/browser /usr/share/nginx/html

EXPOSE 8080
```

Configuration Nginx associée (gzip/brotli, cache statique long, fallback SPA) :

```nginx
# infra/docker/nginx.conf
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json
               application/wasm image/svg+xml font/woff2;
    gzip_min_length 1024;

    # Brotli si le module nginx-mod-brotli est présent dans l'image (sinon gzip suffit)
    # brotli on;
    # brotli_types text/plain text/css application/javascript application/json;

    location ~* \.(?:js|css|woff2?|svg|png|jpg|jpeg|webp|avif)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    # Fallback SPA : toute route inconnue retombe sur index.html (routing Angular côté client)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
docker build -f infra/docker/frontend.Dockerfile -t oei-frontend:latest --platform linux/arm64 .
```

---

## 9. Composition de production (`docker-compose.prod.yml`) et TLS

Différences majeures par rapport à `infra/docker-compose.yml` (local) :
- **Aucun `ports:` publié** pour `postgres`, `keycloak`, `backend` — uniquement le réseau
  Docker interne `oei-net`.
- `minio`/`minio-init` **supprimés** (remplacés par S3, §6).
- Ajout de `caddy` comme unique point d'entrée réseau (443/80).
- `keycloak` démarre en mode `start` (production), pas `start-dev`.

```yaml
# infra/docker-compose.prod.yml
name: oei

networks:
  oei-net:
    driver: bridge

volumes:
  postgres-data:
  caddy-data:
  caddy-config:

services:
  postgres:
    image: postgres:17
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${OEI_USER}
      POSTGRES_PASSWORD: ${OEI_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      OEI_APP_PASSWORD: ${OEI_APP_PASSWORD}
    # Pas de "ports:" : accessible uniquement depuis oei-net (keycloak, backend).
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./postgres-init:/docker-entrypoint-initdb.d
    networks: [oei-net]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${OEI_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10

  keycloak:
    image: quay.io/keycloak/keycloak:25.0
    restart: unless-stopped
    command: start --import-realm --hostname=auth.theitorder.global --proxy-headers=xforwarded
    environment:
      KEYCLOAK_ADMIN: ${OEI_USER}
      KEYCLOAK_ADMIN_PASSWORD: ${OEI_PASSWORD}
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      KC_DB_USERNAME: ${OEI_USER}
      KC_DB_PASSWORD: ${OEI_PASSWORD}
      KC_HOSTNAME_STRICT_HTTPS: "true"
    # Pas de "ports:" : Caddy proxy vers keycloak:8080 via oei-net.
    volumes:
      - ../keycloak/realm-export:/opt/keycloak/data/import
      - ../keycloak/themes/oei:/opt/keycloak/themes/oei
    depends_on:
      postgres:
        condition: service_healthy
    networks: [oei-net]

  backend:
    image: <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/oei-backend:latest
    restart: unless-stopped
    environment:
      OEI_DB_USER: oei_app
      OEI_DB_PASSWORD: ${OEI_APP_PASSWORD}
      OEI_OIDC_ISSUER_URI: ${OEI_OIDC_ISSUER_URI}
      OEI_S3_PUBLIC_BUCKET: oei-public
      OEI_S3_MEMBERSHIP_BUCKET: oei-membership
      AWS_REGION: eu-west-3
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
    # Pas de "ports:" : Caddy proxy vers backend:8080 via oei-net.
    depends_on:
      postgres:
        condition: service_healthy
      keycloak:
        condition: service_started
    networks: [oei-net]

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config
    depends_on: [backend, keycloak]
    networks: [oei-net]
```

`Caddyfile` — reverse-proxy + TLS Let's Encrypt automatique (renouvellement géré nativement
par Caddy, aucun cron/certbot à opérer) :

```caddyfile
# infra/Caddyfile
api.theitorder.global {
    reverse_proxy backend:8080
    encode gzip
}

auth.theitorder.global {
    reverse_proxy keycloak:8080
    encode gzip
}
```

C'est la solution la plus simple à opérer sans "service manager" : un seul conteneur,
configuration déclarative de quelques lignes, renouvellement TLS automatique intégré
(vs. `certbot` qui nécessite un cron/timer systemd séparé et un rechargement manuel de
Nginx après chaque renouvellement).

---

## 10. Déploiement initial sur le serveur

Toutes les commandes ci-dessous s'exécutent en tant qu'utilisateur `oei-deploy` (§5.3),
jamais en root.

```bash
# 1. Installer Docker Engine + plugin Compose (Amazon Linux 2023)
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker oei-deploy   # déjà fait en §5.3, rappel
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64 \
  -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
docker compose version

# 2. Installer AWS CLI v2 (pour fetch-secrets.sh et opérations S3/SSM locales)
curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o awscliv2.zip
unzip awscliv2.zip && sudo ./aws/install

# 3. Récupérer le code de déploiement (dossier infra uniquement, pas tout le repo applicatif)
mkdir -p ~/oei && cd ~/oei
git clone --depth 1 --filter=blob:none --sparse <URL_REPO> .
git sparse-checkout set infra

# 4. Authentification au registre d'images (ECR)
aws ecr get-login-password --region eu-west-3 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com

# 5. Récupérer les secrets depuis SSM (§7.2)
bash infra/scripts/fetch-secrets.sh

# 6. Premier démarrage
cd infra
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d

# 7. Vérifications
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f caddy
curl -I https://api.theitorder.global/actuator/health
curl -I https://auth.theitorder.global/realms/oei
```

### 10.1 Redéploiements ultérieurs (mise à jour d'image)

```bash
cd ~/oei/infra
docker build -f docker/backend.Dockerfile -t oei-backend:latest --platform linux/arm64 .
docker tag oei-backend:latest <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/oei-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/oei-backend:latest

# Sur le serveur :
docker compose -f docker-compose.prod.yml pull backend
docker compose -f docker-compose.prod.yml up -d --no-deps backend
```

> En l'absence de tout orchestrateur, ce redémarrage cause une coupure de quelques
> secondes du backend (un seul serveur, pas de rolling update). Acceptable pour ce
> périmètre ; à documenter dans les fenêtres de maintenance si le trafic devient
> significatif.

---

## 11. CDN : CloudFront + S3 pour les assets Angular

### 11.1 Bucket S3 dédié au frontend statique

```bash
aws s3api create-bucket --bucket oei-web-static --region eu-west-3 \
  --create-bucket-configuration LocationConstraint=eu-west-3
aws s3api put-public-access-block --bucket oei-web-static --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

Le bucket reste **entièrement privé** : seul CloudFront y accède, via un Origin Access
Control (OAC) — pas de lecture publique directe sur S3.

### 11.2 Distribution CloudFront

```bash
aws cloudfront create-origin-access-control --origin-access-control-config '{
  "Name": "oei-web-oac",
  "SigningProtocol": "sigv4",
  "SigningBehavior": "always",
  "OriginAccessControlOriginType": "s3"
}'

aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "oei-web-init",
  "Comment": "OEI frontend statique",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "Aliases": {"Quantity": 2, "Items": ["theitorder.global", "www.theitorder.global"]},
  "ViewerCertificate": {
    "AcmCertificateArn": "<ARN_CERTIFICAT_ACM>",
    "SslSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "Origins": {"Quantity": 1, "Items": [{
    "Id": "oei-web-static-origin",
    "DomainName": "oei-web-static.s3.eu-west-3.amazonaws.com",
    "OriginAccessControlId": "<OAC_ID>",
    "S3OriginConfig": {"OriginAccessIdentity": ""}
  }]},
  "DefaultCacheBehavior": {
    "TargetOriginId": "oei-web-static-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "Compress": true
  },
  "CustomErrorResponses": {"Quantity": 1, "Items": [{
    "ErrorCode": 404, "ResponsePagePath": "/index.html",
    "ResponseCode": "200", "ErrorCachingMinTTL": 10
  }]}
}'
```

`CustomErrorResponses` (404 → `index.html`, code 200) reproduit le fallback SPA du routeur
Angular sans passer par un serveur applicatif.

Le certificat ACM (`AcmCertificateArn`) doit être demandé dans **`us-east-1`** (contrainte
CloudFront, quelle que soit la région applicative) :

```bash
aws acm request-certificate \
  --domain-name theitorder.global \
  --subject-alternative-names www.theitorder.global \
  --validation-method DNS \
  --region us-east-1
```

Puis créer l'enregistrement CNAME de validation renvoyé par la commande dans la hosted
zone Route 53 (§2), et attendre le passage en statut `ISSUED`.

### 11.3 Publication du build Angular

```bash
cd frontend/oei-web
pnpm install --frozen-lockfile
pnpm run build   # copy:content + ng build, configuration production par défaut

aws s3 sync dist/oei-web/browser s3://oei-web-static --delete \
  --cache-control "public, max-age=31536000, immutable" --exclude "index.html"
aws s3 cp dist/oei-web/browser/index.html s3://oei-web-static/index.html \
  --cache-control "no-cache"

# Invalidation du cache CloudFront pour propager immédiatement le nouvel index.html
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/index.html" "/"
```

### 11.4 Bascule DNS finale

```bash
aws route53 change-resource-record-sets --hosted-zone-id <ID_ZONE> --change-batch '{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "theitorder.global",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "<DISTRIBUTION_DOMAIN_NAME>.cloudfront.net",
        "EvaluateTargetHealth": false
      }
    }
  }]
}'
```

(`Z2FDTNDATAQYW2` est l'identifiant de zone hébergée générique de CloudFront, constant
pour toutes les distributions.) Répéter pour `www.theitorder.global`.

---

## 12. Durcissement système (ufw, fail2ban, mises à jour)

### 12.1 `ufw` en défense en profondeur devant Docker

```bash
sudo dnf install -y ufw || sudo apt-get install -y ufw   # selon la distribution finale
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Docker manipule directement iptables et peut contourner ufw : rediriger la chaîne
# DOCKER-USER pour que ufw garde le dernier mot sur le trafic vers les conteneurs.
sudo tee -a /etc/ufw/after.rules > /dev/null <<'EOF'
*filter
:DOCKER-USER - [0:0]
-A DOCKER-USER -j ufw-user-input
-A DOCKER-USER -j RETURN
COMMIT
EOF

sudo ufw enable
sudo ufw status verbose
```

### 12.2 `fail2ban` pour SSH

```bash
sudo dnf install -y fail2ban || sudo apt-get install -y fail2ban
sudo tee /etc/fail2ban/jail.d/sshd.local > /dev/null <<'EOF'
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/secure
maxretry = 4
bantime = 3600
findtime = 600
EOF
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

### 12.3 Mises à jour automatiques de sécurité

```bash
sudo dnf install -y dnf-automatic
sudo sed -i 's/^apply_updates = no/apply_updates = yes/' /etc/dnf/automatic.conf
sudo systemctl enable --now dnf-automatic.timer
```

---

## 13. Sauvegardes et reprise après sinistre

### 13.1 Snapshots EBS automatisés (Data Lifecycle Manager)

```bash
aws dlm create-lifecycle-policy \
  --description "Snapshots quotidiens volume racine oei-prod" \
  --state ENABLED \
  --execution-role-arn arn:aws:iam::<ACCOUNT_ID>:role/AWSDataLifecycleManagerDefaultRole \
  --policy-details '{
    "ResourceTypes": ["VOLUME"],
    "TargetTags": [{"Key": "Name", "Value": "oei-prod"}],
    "Schedules": [{
      "Name": "daily-snapshots",
      "CreateRule": {"Interval": 24, "IntervalUnit": "HOURS", "Times": ["03:00"]},
      "RetainRule": {"Count": 7},
      "CopyTags": true
    }]
  }'
```

Rétention 7 jours glissants ; ajuster si une rétention plus longue est requise
réglementairement.

### 13.2 `pg_dump` régulier vers S3

Script exécuté par un timer systemd (pas de cron requis, cohérent avec le reste de la
gestion système par `systemd`) :

```bash
#!/usr/bin/env bash
# infra/scripts/backup-postgres.sh
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DUMP_FILE="/tmp/oei-${TIMESTAMP}.sql.gz"

docker compose -f /home/oei-deploy/oei/infra/docker-compose.prod.yml exec -T postgres \
  pg_dump -U "${OEI_USER}" "${POSTGRES_DB}" | gzip > "${DUMP_FILE}"

aws s3 cp "${DUMP_FILE}" "s3://oei-backups/postgres/${TIMESTAMP}.sql.gz"
rm -f "${DUMP_FILE}"
```

```ini
# /etc/systemd/system/oei-backup.service
[Unit]
Description=Sauvegarde quotidienne PostgreSQL OEI vers S3

[Service]
Type=oneshot
User=oei-deploy
ExecStart=/home/oei-deploy/oei/infra/scripts/backup-postgres.sh
```

```ini
# /etc/systemd/system/oei-backup.timer
[Unit]
Description=Déclenchement quotidien de oei-backup.service

[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable --now oei-backup.timer
sudo systemctl list-timers oei-backup.timer
```

Lifecycle S3 déjà configuré sur `oei-backups` (§6.4) : bascule vers `STANDARD_IA` après 30
jours, `GLACIER_IR` après 90 jours, expiration après 365 jours.

### 13.3 Procédure de restauration (résumé)

1. Lancer une nouvelle instance depuis le dernier snapshot EBS (`aws ec2 create-volume
   --snapshot-id ...`) si perte totale de l'instance.
2. Ou, pour une restauration ciblée de la base : télécharger le dernier dump
   (`aws s3 cp s3://oei-backups/postgres/<dernier>.sql.gz -`), puis
   `gunzip | docker compose exec -T postgres psql -U ${OEI_USER} ${POSTGRES_DB}`.

---

## 14. Supervision, logs et alerting

### 14.1 CloudWatch Agent (déjà autorisé par le rôle IAM, §5.4)

```bash
sudo dnf install -y amazon-cloudwatch-agent
sudo tee /opt/aws/amazon-cloudwatch-agent/etc/config.json > /dev/null <<'EOF'
{
  "metrics": {
    "metrics_collected": {
      "mem": {"measurement": ["mem_used_percent"]},
      "disk": {"measurement": ["used_percent"], "resources": ["/"]},
      "cpu": {"measurement": ["cpu_usage_active"]}
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {"file_path": "/var/log/secure", "log_group_name": "oei-prod-secure"},
          {"file_path": "/var/log/messages", "log_group_name": "oei-prod-system"}
        ]
      }
    }
  }
}
EOF
sudo systemctl enable --now amazon-cloudwatch-agent
```

### 14.2 Alarmes CloudWatch clés

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name oei-prod-cpu-high \
  --metric-name CPUUtilization --namespace AWS/EC2 \
  --statistic Average --period 300 --threshold 85 \
  --comparison-operator GreaterThanThreshold --evaluation-periods 3 \
  --dimensions Name=InstanceId,Value=<INSTANCE_ID> \
  --alarm-actions <ARN_SNS_TOPIC>

aws cloudwatch put-metric-alarm \
  --alarm-name oei-prod-status-check-failed \
  --metric-name StatusCheckFailed --namespace AWS/EC2 \
  --statistic Maximum --period 60 --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold --evaluation-periods 2 \
  --dimensions Name=InstanceId,Value=<INSTANCE_ID> \
  --alarm-actions <ARN_SNS_TOPIC>
```

### 14.3 Logs applicatifs

Les logs Docker (`backend`, `keycloak`, `postgres`, `caddy`) restent consultables via
`docker compose logs`. Pour une conservation plus longue, un driver de logging `awslogs`
peut être ajouté sur chaque service de `docker-compose.prod.yml` :

```yaml
    logging:
      driver: awslogs
      options:
        awslogs-region: eu-west-3
        awslogs-group: oei-prod-app
        awslogs-create-group: "true"
```

---

## 15. Estimation de coût mensuel détaillée

Ordres de grandeur en USD, région `eu-west-3` (Paris) sauf mention contraire. Chiffres
indicatifs — se référer à la facturation réelle AWS pour un budget définitif.

| Poste | Détail | Coût mensuel approx. (USD) |
|---|---|---|
| EC2 `t4g.large` Reserved (1 an, No Upfront) | ~0,051 USD/h équivalent × 730h | **~37** |
| EBS `gp3` 30 Go chiffré | ~0,0928 USD/Go/mois | **~2,8** |
| Elastic IP | Gratuite tant qu'associée à une instance en cours d'exécution | **0** |
| Route 53 — hosted zone | 0,50 USD/zone/mois | **~0,5** |
| Route 53 — requêtes DNS | ~0,40 USD / million de requêtes (trafic modeste) | **~1** |
| Domaine `.global` (registration annuelle) | ~30-80 USD/an selon registrar → lissé au mois | **~4 à 7** |
| S3 (3 buckets applicatifs + statique + backups, volumétrie modeste < 20 Go) | Stockage + requêtes | **~1 à 3** |
| CloudFront (CDN, trafic modeste < 100 Go/mois sortant) | ~0,085 USD/Go (Europe/US) + requêtes | **~5 à 10** |
| Transferts sortants EC2 (API + auth, hors CloudFront) | 1 Go gratuit, puis ~0,09 USD/Go | **~2 à 5** |
| CloudWatch (métriques custom + logs modestes) | Tier gratuit large, dépassement marginal | **~1 à 2** |
| SSM Parameter Store (Standard) | Gratuit | **0** |
| AWS Budgets | Gratuit (jusqu'à 2 budgets) | **0** |
| ACM (certificats TLS CloudFront) | Gratuit | **0** |
| DLM (snapshots EBS) | Coût du stockage des snapshots seul, ~0,05 USD/Go/mois, volume modeste | **~0,5 à 1** |
| **Total estimé** | | **~55 à 70 USD/mois** |

Comparatif Reserved vs On-Demand (delta annuel, EC2 seule) : Reserved 1 an No Upfront
économise environ **190 USD/an** par rapport à l'On-Demand — cf. tableau §4.3. Aucun NAT
Gateway n'est provisionné (l'instance a une IP publique directe via Elastic IP, en subnet
public) : un NAT Gateway coûterait à lui seul environ 32 USD/mois de frais fixes + trafic,
inutile ici puisqu'aucune ressource privée sans IP publique n'a besoin de sortir vers
Internet.

Seuil d'alerte AWS Budgets recommandé : **80 USD/mois** (§3.3), avec marge sur cette
estimation pour absorber la montée en charge progressive du trafic.

---

## 16. Check-list de mise en production

### Domaine et DNS
- [ ] Disponibilité de `theitorder.global` vérifiée sur Route 53 Domains (§2.1)
- [ ] Domaine acheté (Route 53 Domains ou registrar tiers + délégation NS, §2.2/§2.3)
- [ ] Hosted zone Route 53 créée et NS propagés (`dig NS theitorder.global`)
- [ ] Enregistrements `api.` et `auth.` pointant vers l'Elastic IP
- [ ] Enregistrement apex + `www.` pointant vers CloudFront (alias)

### Compte AWS
- [ ] Utilisateur IAM `oei-admin` créé, MFA activée, clés root non utilisées au quotidien
- [ ] AWS Budgets configuré avec alertes email (§3.3)

### Instance et réseau
- [ ] Reserved Instance `t4g.large` 1 an No Upfront achetée dans la bonne région/AZ
- [ ] Instance EC2 lancée avec EBS chiffré, Instance Profile attaché, Elastic IP associée
- [ ] Security Group : seuls 443/80 (monde) et 22 (IP admin uniquement) ouverts
- [ ] Aucun port Postgres/Keycloak/backend publié vers l'hôte ou Internet
- [ ] SSH par clé uniquement, `PasswordAuthentication no`, `PermitRootLogin no`
- [ ] Utilisateur non-root `oei-deploy` créé, membre du groupe `docker`

### Stockage et secrets
- [ ] Buckets `oei-public`, `oei-membership`, `oei-backups`, `oei-web-static` créés
- [ ] Public Access Block correctement configuré par bucket (public en lecture seule
      uniquement sur `oei-public`)
- [ ] Chiffrement par défaut + versioning activés sur tous les buckets
- [ ] Lifecycle rules S3 en place (transition classes froides + expiration)
- [ ] Rôle IAM Instance Profile scopé strictement S3 + SSM + CloudWatch (§5.4)
- [ ] Secrets déposés dans SSM Parameter Store, aucune clé AWS statique sur le serveur

### Images et déploiement
- [ ] `backend.Dockerfile` multi-stage avec `layertools` construit et poussé sur ECR
- [ ] `frontend.Dockerfile` multi-stage construit (usage local/staging), build de
      production Angular synchronisé vers `oei-web-static`
- [ ] `docker-compose.prod.yml` déployé, `caddy` seul point d'entrée réseau
- [ ] TLS Let's Encrypt actif sur `api.` et `auth.` (Caddy), certificat ACM actif sur
      CloudFront pour l'apex/`www.`
- [ ] Keycloak démarré en mode `start` (pas `start-dev`) avec royaume importé

### Sécurité
- [ ] `ufw` actif avec règle `DOCKER-USER` pour reprendre la main sur le trafic Docker
- [ ] `fail2ban` actif sur `sshd`
- [ ] Mises à jour de sécurité automatiques activées (`dnf-automatic`)

### Sauvegardes et supervision
- [ ] Politique DLM de snapshots EBS quotidiens active (rétention 7 jours)
- [ ] Timer systemd `oei-backup.timer` actif (`pg_dump` quotidien vers `oei-backups`)
- [ ] CloudWatch Agent installé, alarmes CPU/StatusCheckFailed configurées
- [ ] Procédure de restauration testée au moins une fois avant mise en production réelle

### Validation finale
- [ ] `curl -I https://theitorder.global` retourne 200 (CloudFront/S3)
- [ ] `curl -I https://api.theitorder.global/actuator/health` retourne `UP`
- [ ] `curl -I https://auth.theitorder.global/realms/oei` retourne le royaume Keycloak
- [ ] Flux de connexion OIDC complet testé de bout en bout (frontend → Keycloak → backend)
- [ ] AWS Budgets confirmé actif avec destinataire email correct
