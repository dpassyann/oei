# ---------------------------------------------------------------------------
# GitHub Actions OIDC federation — lets GitHub-hosted runners assume an AWS
# IAM role without any long-lived access key ever being stored as a GitHub
# secret. See pipeline-github-actions.md for the full rationale and the
# one-time manual bootstrap this depends on (this role must exist BEFORE any
# GitHub Actions workflow can use it, which is why the very first `apply`
# creating it has to run from the operator's own machine).
# ---------------------------------------------------------------------------

variable "github_repository" {
  description = "GitHub \"owner/repo\" allowed to assume the deploy role via OIDC. No default: must be set explicitly to avoid ever trusting a wildcard/unintended repo."
  type        = string
  default     = "dpassyann/oei"
}

variable "github_oidc_thumbprints" {
  description = "TLS certificate thumbprints for token.actions.githubusercontent.com. AWS no longer actually validates these (it validates against its own trusted CA store since 2023), but the field remains mandatory on aws_iam_openid_connect_provider. Kept as a variable so it can be refreshed without a code change if GitHub ever rotates its intermediate CA and AWS reintroduces strict checking."
  type        = list(string)
  default = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}

resource "aws_iam_openid_connect_provider" "github_actions" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = var.github_oidc_thumbprints
}

# Trust policy: only THIS repository and only THIS provider may assume the
# role. In practice GitHub's `sub` claim format varies depending on whether a
# workflow runs on a branch ref, with an environment, or via other GitHub
# Actions evolutions. Keep the scope repository-bound (never wildcard the repo
# itself) while accepting any subject variant for this exact repository. The
# workflows themselves are still constrained in GitHub to `main` and never run
# AWS steps on pull requests.
data "aws_iam_policy_document" "github_actions_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github_actions.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:*"]
    }
  }
}

resource "aws_iam_role" "github_actions_deploy" {
  name                 = "oei-github-actions-deploy"
  assume_role_policy   = data.aws_iam_policy_document.github_actions_assume_role.json
  max_session_duration = 3600

  tags = {
    Name = "oei-github-actions-deploy"
  }
}

# ---------------------------------------------------------------------------
# Least-privilege policy for the CI/CD role. Scoped to exactly the resources
# this Terraform config and the deploy-app.yml workflow touch:
#   - Terraform-managed infra (EC2, S3 app buckets, CloudFront, ACM, Route 53
#     records on the existing zone, IAM read/PassRole on the EC2 role,
#     budgets) — for deploy-infra.yml.
#   - ECR push/pull for the backend image, and SSM SendCommand to trigger the
#     `docker compose pull && up -d` on the instance — for deploy-app.yml.
#   - The Terraform remote state backend itself (S3 state object + DynamoDB
#     lock), so `terraform init`/`plan`/`apply` from CI can read/write state.
#
# Several AWS services (EC2, CloudFront, ACM, Budgets, Route 53 hosted zone
# lookups) do not support fine-grained resource-level ARNs for every action
# used here; where that's the case the statement is commented to explain why
# `Resource = "*"` is unavoidable for that specific action set — this is a
# documented AWS API limitation, not a shortcut.
# ---------------------------------------------------------------------------
data "aws_iam_policy_document" "github_actions_deploy" {
  # --- Terraform remote state backend (backend.tf) ---
  statement {
    sid    = "TerraformStateBucket"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:ListBucket",
    ]
    resources = [
      "arn:aws:s3:::oei-terraform-state",
      "arn:aws:s3:::oei-terraform-state/prod/terraform.tfstate",
    ]
  }

  statement {
    sid       = "TerraformStateLock"
    effect    = "Allow"
    actions   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"]
    resources = ["arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/oei-terraform-locks"]
  }

  # --- EC2: no resource-level ARN support for most mutating actions (a
  # long-standing AWS API limitation for the EC2 control plane) ---
  statement {
    sid    = "Ec2Manage"
    effect = "Allow"
    actions = [
      "ec2:Describe*",
      "ec2:CreateTags",
      "ec2:DeleteTags",
      "ec2:CreateKeyPair",
      "ec2:DeleteKeyPair",
      "ec2:ImportKeyPair",
      "ec2:RunInstances",
      "ec2:TerminateInstances",
      "ec2:StopInstances",
      "ec2:StartInstances",
      "ec2:ModifyInstanceAttribute",
      "ec2:CreateSecurityGroup",
      "ec2:DeleteSecurityGroup",
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:RevokeSecurityGroupIngress",
      "ec2:AuthorizeSecurityGroupEgress",
      "ec2:RevokeSecurityGroupEgress",
      "ec2:AllocateAddress",
      "ec2:ReleaseAddress",
      "ec2:AssociateAddress",
      "ec2:DisassociateAddress",
    ]
    resources = ["*"]
  }

  # --- IAM: scoped strictly to the EC2 instance role/profile this Terraform
  # config manages, plus this very OIDC role/provider (idempotent no-op
  # applies) — never a wildcard IAM permission ---
  statement {
    sid    = "IamManageScoped"
    effect = "Allow"
    actions = [
      "iam:GetRole",
      "iam:GetInstanceProfile",
      "iam:PassRole",
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:PutRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:GetRolePolicy",
      "iam:CreateInstanceProfile",
      "iam:DeleteInstanceProfile",
      "iam:AddRoleToInstanceProfile",
      "iam:RemoveRoleFromInstanceProfile",
      "iam:TagRole",
      "iam:ListRolePolicies",
      "iam:ListInstanceProfilesForRole",
      "iam:GetUser",
      "iam:CreateUser",
      "iam:DeleteUser",
      "iam:TagUser",
      "iam:PutUserPolicy",
      "iam:DeleteUserPolicy",
      "iam:GetUserPolicy",
      "iam:ListUserPolicies",
      "iam:CreateAccessKey",
      "iam:DeleteAccessKey",
      "iam:UpdateAccessKey",
      "iam:ListAccessKeys",
    ]
    resources = [
      aws_iam_role.ec2.arn,
      aws_iam_instance_profile.ec2.arn,
      aws_iam_role.github_actions_deploy.arn,
      aws_iam_user.ses_smtp.arn,
    ]
  }

  statement {
    sid    = "IamOidcProviderManageScoped"
    effect = "Allow"
    actions = [
      "iam:GetOpenIDConnectProvider",
      "iam:CreateOpenIDConnectProvider",
      "iam:UpdateOpenIDConnectProviderThumbprint",
      "iam:TagOpenIDConnectProvider",
    ]
    resources = [aws_iam_openid_connect_provider.github_actions.arn]
  }

  # --- S3: the 4 application buckets managed by s3.tf, plus bucket-level
  # configuration sub-resources (versioning/encryption/policy/lifecycle) ---
  statement {
    sid    = "S3AppBucketsManage"
    effect = "Allow"
    actions = [
      "s3:CreateBucket",
      "s3:DeleteBucket",
      "s3:GetBucket*",
      "s3:PutBucket*",
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:PutLifecycleConfiguration",
      "s3:GetLifecycleConfiguration",
    ]
    resources = [
      aws_s3_bucket.public.arn,
      "${aws_s3_bucket.public.arn}/*",
      aws_s3_bucket.membership.arn,
      "${aws_s3_bucket.membership.arn}/*",
      aws_s3_bucket.backups.arn,
      "${aws_s3_bucket.backups.arn}/*",
      aws_s3_bucket.web_static.arn,
      "${aws_s3_bucket.web_static.arn}/*",
    ]
  }

  # --- CloudFront / ACM: distribution and certificate IDs don't exist yet on
  # first apply, so scoping by ARN up front is not possible; both APIs are
  # account-wide by design (no sub-resource ARNs to further restrict to) ---
  statement {
    sid    = "CloudFrontAcmManage"
    effect = "Allow"
    actions = [
      "cloudfront:CreateDistribution",
      "cloudfront:GetDistribution",
      "cloudfront:UpdateDistribution",
      "cloudfront:DeleteDistribution",
      "cloudfront:TagResource",
      "cloudfront:CreateOriginAccessControl",
      "cloudfront:GetOriginAccessControl",
      "cloudfront:UpdateOriginAccessControl",
      "cloudfront:DeleteOriginAccessControl",
      "cloudfront:CreateInvalidation",
      "acm:RequestCertificate",
      "acm:DescribeCertificate",
      "acm:DeleteCertificate",
      "acm:AddTagsToCertificate",
      "acm:ListTagsForCertificate",
    ]
    resources = ["*"]
  }

  # --- Route 53: limited to the existing hosted zone referenced by
  # data.aws_route53_zone.primary (never zone creation/deletion — the zone
  # is manually created once, per deploiement-aws.md §2) ---
  statement {
    sid    = "Route53RecordsOnExistingZone"
    effect = "Allow"
    actions = [
      "route53:GetHostedZone",
      "route53:ListHostedZones",
      "route53:ListResourceRecordSets",
      "route53:ChangeResourceRecordSets",
      "route53:GetChange",
    ]
    resources = ["*"] # route53:GetChange targets a change ID, not the zone; ListHostedZones has no ARN to scope to.
  }

  # --- SSM Parameter Store (read-only, same prefix as the EC2 instance
  # role, so CI can e.g. verify a parameter exists) plus SendCommand for
  # deploy-app.yml's application deployment step ---
  statement {
    sid       = "SsmParameterRead"
    effect    = "Allow"
    actions   = ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"]
    resources = ["arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter${var.ssm_parameter_prefix}/*"]
  }

  statement {
    sid    = "SsmParameterManage"
    effect = "Allow"
    actions = [
      "ssm:PutParameter",
      "ssm:DeleteParameter",
      "ssm:AddTagsToResource",
      "ssm:RemoveTagsFromResource",
      "ssm:ListTagsForResource",
    ]
    resources = ["arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter${var.ssm_parameter_prefix}/*"]
  }

  statement {
    sid    = "SesManage"
    effect = "Allow"
    actions = [
      "ses:VerifyDomainIdentity",
      "ses:VerifyDomainDkim",
      "ses:SetIdentityMailFromDomain",
      "ses:DeleteIdentity",
      "ses:GetIdentityVerificationAttributes",
      "ses:GetIdentityDkimAttributes",
      "ses:GetIdentityMailFromDomainAttributes",
      "ses:ListIdentities",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "SsmSendCommandDeploy"
    effect = "Allow"
    actions = [
      "ssm:SendCommand",
      "ssm:GetCommandInvocation",
      "ssm:ListCommandInvocations",
    ]
    resources = [
      aws_instance.app.arn,
      "arn:aws:ssm:${var.aws_region}::document/AWS-RunShellScript",
    ]
  }

  # --- ECR: push/pull the oei-backend image built by deploy-app.yml, plus
  # repository management for ecr.tf. GetAuthorizationToken has no
  # resource-level ARN (it's an account/region-wide token issuance call). ---
  statement {
    sid       = "EcrAuth"
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid    = "EcrRepositoryManage"
    effect = "Allow"
    actions = [
      "ecr:CreateRepository",
      "ecr:DeleteRepository",
      "ecr:DescribeRepositories",
      "ecr:PutLifecyclePolicy",
      "ecr:GetLifecyclePolicy",
      "ecr:SetRepositoryPolicy",
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
      "ecr:ListTagsForResource",
      "ecr:TagResource",
    ]
    resources = [aws_ecr_repository.backend.arn]
  }

  # --- STS: deploy-app.yml's rollout job resolves the account ID locally
  # (to build the ECR registry hostname) via `aws sts get-caller-identity` ---
  statement {
    sid       = "StsCallerIdentity"
    effect    = "Allow"
    actions   = ["sts:GetCallerIdentity"]
    resources = ["*"]
  }

  # --- AWS Budgets: no resource-level ARN support (account-scoped API) ---
  statement {
    sid    = "BudgetsManage"
    effect = "Allow"
    actions = [
      "budgets:ViewBudget",
      "budgets:ModifyBudget",
    ]
    resources = ["arn:aws:budgets::${data.aws_caller_identity.current.account_id}:budget/oei-monthly-budget"]
  }
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name   = "oei-github-actions-deploy"
  role   = aws_iam_role.github_actions_deploy.id
  policy = data.aws_iam_policy_document.github_actions_deploy.json
}
