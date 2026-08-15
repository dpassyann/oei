# ---------------------------------------------------------------------------
# Variables WITHOUT a default value MUST be set by the operator before
# `terraform apply` (via terraform.tfvars, -var, or TF_VAR_* environment
# variables). See README.md for the full list and rationale.
# ---------------------------------------------------------------------------

variable "aws_region" {
  description = "Applicative AWS region. deploiement-aws.md (§3.1) uses eu-west-3 (Paris) as the reference region; adjust if the target audience is mostly elsewhere. Note: ACM for CloudFront is always requested in us-east-1 regardless of this value."
  type        = string
  default     = "eu-west-3"
}

variable "domain_name" {
  description = "Public apex domain name, already decided (theitorder.global). No default on purpose: this Terraform must never silently apply to the wrong domain."
  type        = string

  validation {
    condition     = length(var.domain_name) > 0
    error_message = "domain_name must not be empty."
  }
}

variable "route53_zone_id" {
  description = "Hosted zone ID for domain_name, OPTIONAL. A domain name cannot be purchased by Terraform (see deploiement-aws.md §2) and the hosted zone is expected to already exist manually. Leave empty to let Terraform look up the zone by name via a data source; set explicitly if you have several zones with the same name or want to avoid the lookup."
  type        = string
  default     = ""
}

variable "ssh_allowed_cidr" {
  description = "CIDR block allowed to reach TCP/22 on the EC2 instance (e.g. \"203.0.113.10/32\" for a single admin IP). No default: 0.0.0.0/0 must never be the default for SSH (deploiement-aws.md §5.1)."
  type        = string

  validation {
    condition     = var.ssh_allowed_cidr != "0.0.0.0/0" && var.ssh_allowed_cidr != "::/0"
    error_message = "ssh_allowed_cidr must not be a wide-open CIDR (0.0.0.0/0 or ::/0). Restrict it to the administrator's IP address(es)."
  }
}

variable "ssh_key_pair_name" {
  description = "Name to give the AWS key pair imported for SSH access to the EC2 instance."
  type        = string
  default     = "oei-prod-key"
}

variable "ssh_public_key" {
  description = "Content of the SSH public key to import (e.g. \"cat ~/.ssh/oei-prod-key.pub\"). No default: this must be the operator's own key, never a shared/example key."
  type        = string

  validation {
    condition     = length(trimspace(var.ssh_public_key)) > 0
    error_message = "ssh_public_key must not be empty."
  }
}

variable "budget_alert_email" {
  description = "Email address to receive AWS Budgets alerts (80% actual, 100% forecasted) and CloudWatch alarm notifications. No default: alerts must reach a real, monitored mailbox."
  type        = string

  validation {
    condition     = can(regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", var.budget_alert_email))
    error_message = "budget_alert_email must look like a valid email address."
  }
}

variable "monthly_budget_amount_usd" {
  description = "Monthly cost budget in USD that triggers AWS Budgets alerts. deploiement-aws.md (§3.3, §15) estimates ~55-70 USD/month total and recommends an 80 USD/month threshold; no default here so the operator makes a conscious choice."
  type        = number

  validation {
    condition     = var.monthly_budget_amount_usd > 0
    error_message = "monthly_budget_amount_usd must be a positive number."
  }
}

variable "environment" {
  description = "Environment tag/name, e.g. production."
  type        = string
  default     = "production"
}

variable "common_tags" {
  description = "Common tags applied to every resource via provider default_tags."
  type        = map(string)
  default = {
    Project     = "OEI"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

# ---------------------------------------------------------------------------
# Network — the manual explicitly rules out a managed container orchestrator
# and this is a single-instance deployment, so we reuse the region's default
# VPC/subnet rather than provisioning a dedicated VPC. See README.md for how
# to switch to a dedicated VPC later if needed.
# ---------------------------------------------------------------------------

variable "vpc_id" {
  description = "VPC ID to deploy into. Leave empty to use the region's default VPC (looked up automatically). Set explicitly to use a dedicated/non-default VPC."
  type        = string
  default     = ""
}

variable "subnet_id" {
  description = "Public subnet ID to launch the EC2 instance into. Leave empty to use the first available subnet of the default VPC (looked up automatically)."
  type        = string
  default     = ""
}

# ---------------------------------------------------------------------------
# EC2
# ---------------------------------------------------------------------------

variable "instance_type" {
  description = "EC2 instance type. deploiement-aws.md (§4.2) settles on t4g.large (Graviton2 ARM64, 2 vCPU, 8 GiB RAM) over t4g.medium (4 GiB, no headroom with Keycloak+Postgres+JVM running together)."
  type        = string
  default     = "t4g.large"
}

variable "root_volume_size_gb" {
  description = "Root EBS volume size in GiB. deploiement-aws.md (§4.4) provisions 30 GiB gp3, described as largely sufficient for Docker images + Postgres/Keycloak volumes; kept as the default here to stay consistent with the manual."
  type        = number
  default     = 30
}

variable "root_volume_delete_on_termination" {
  description = "Whether the root EBS volume is deleted when the instance is terminated. The manual sets this to false as an extra safety net against accidental instance deletion (deploiement-aws.md §4.4)."
  type        = bool
  default     = false
}

# ---------------------------------------------------------------------------
# S3 bucket names — kept as variables (with defaults matching the manual) so
# they can be overridden if bucket names are already taken globally, without
# editing resource code.
# ---------------------------------------------------------------------------

variable "s3_public_bucket_name" {
  description = "Name of the S3 bucket for publicly-readable application assets (replaces MinIO's public bucket, deploiement-aws.md §6)."
  type        = string
  default     = "oei-public"
}

variable "s3_membership_bucket_name" {
  description = "Name of the S3 bucket for private membership documents (CVs, dues, etc.)."
  type        = string
  default     = "oei-membership"
}

variable "s3_backups_bucket_name" {
  description = "Name of the S3 bucket for EBS snapshot metadata / pg_dump backups (deploiement-aws.md §13.2)."
  type        = string
  default     = "oei-backups"
}

variable "s3_web_static_bucket_name" {
  description = "Name of the S3 bucket holding the built Angular frontend, served through CloudFront (deploiement-aws.md §11)."
  type        = string
  default     = "oei-web-static"
}

variable "ssm_parameter_prefix" {
  description = "SSM Parameter Store path prefix the EC2 instance role is allowed to read (deploiement-aws.md §5.4, §7)."
  type        = string
  default     = "/oei/prod"
}
