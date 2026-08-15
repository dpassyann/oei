# ---------------------------------------------------------------------------
# Remote Terraform state (S3 + DynamoDB lock table).
#
# Backend blocks cannot reference variables/locals (a Terraform CLI
# limitation: the backend must be resolvable before any variable evaluation),
# so bucket/table names are hard-coded here rather than exposed as
# `variable "..."`. Adjust these two literals in a single PR if you ever need
# to rename them, then re-run `terraform init -migrate-state` once.
#
# IMPORTANT — this bucket and table are NOT created by this Terraform
# configuration (a backend cannot bootstrap the very storage it depends on).
# They are created exactly once, manually, by the human operator, from their
# own machine — see pipeline-github-actions.md "Bootstrap manuel unique",
# step 1, for the exact `aws s3api` / `aws dynamodb` commands.
#
# State currently in this repo (as inherited from the previous agent's work)
# is LOCAL (`terraform.tstate`, gitignored). Migrating it to this backend is
# also part of that one-time manual bootstrap
# (`terraform init -migrate-state`) — it cannot be done from this sandbox
# (no AWS network access here) nor safely automated from CI (state migration
# is an interactive, one-shot operation you want to run and verify by hand).
# ---------------------------------------------------------------------------
terraform {
  backend "s3" {
    bucket         = "oei-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-3"
    dynamodb_table = "oei-terraform-locks"
    encrypt        = true
  }
}
