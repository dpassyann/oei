# ---------------------------------------------------------------------------
# Default VPC / subnet — single-instance deployment, no dedicated VPC needed.
# See README.md "Switching to a dedicated VPC" for how to replace this.
# ---------------------------------------------------------------------------

data "aws_vpc" "default" {
  count   = var.vpc_id == "" ? 1 : 0
  default = true
}

locals {
  vpc_id = var.vpc_id != "" ? var.vpc_id : data.aws_vpc.default[0].id
}

data "aws_subnets" "default" {
  count = var.subnet_id == "" ? 1 : 0

  filter {
    name   = "vpc-id"
    values = [local.vpc_id]
  }

  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

locals {
  subnet_id = var.subnet_id != "" ? var.subnet_id : data.aws_subnets.default[0].ids[0]
}

# ---------------------------------------------------------------------------
# Latest Amazon Linux 2023 ARM64 AMI, resolved via the AWS-maintained SSM
# public parameter rather than a hard-coded AMI ID (deploiement-aws.md §4.4).
# ---------------------------------------------------------------------------

data "aws_ssm_parameter" "al2023_arm64_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}

# ---------------------------------------------------------------------------
# Existing Route 53 hosted zone for the domain. A domain name cannot be
# purchased by Terraform (deploiement-aws.md §2) — the zone is assumed to
# already exist, created manually when the domain was registered.
# ---------------------------------------------------------------------------

data "aws_route53_zone" "primary" {
  zone_id      = var.route53_zone_id != "" ? var.route53_zone_id : null
  name         = var.route53_zone_id == "" ? var.domain_name : null
  private_zone = false
}

data "aws_caller_identity" "current" {}
