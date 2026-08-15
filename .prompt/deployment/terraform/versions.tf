# Terraform and provider version constraints.
#
# Pinned to a reasonably recent Terraform CLI and AWS provider major version,
# without locking to an exact patch release so security fixes still apply.
terraform {
  required_version = ">= 1.7.0, < 2.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}
