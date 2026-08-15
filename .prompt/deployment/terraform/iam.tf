# Least-privilege EC2 instance role: S3 (app buckets), SSM (parameter read
# under /oei/prod/*), CloudWatch Logs/metrics only — never AdministratorAccess
# (deploiement-aws.md §5.4).

data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2" {
  name               = "oei-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

data "aws_iam_policy_document" "ec2_least_privilege" {
  statement {
    sid     = "S3AppBuckets"
    effect  = "Allow"
    actions = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
    resources = [
      aws_s3_bucket.public.arn,
      "${aws_s3_bucket.public.arn}/*",
      aws_s3_bucket.membership.arn,
      "${aws_s3_bucket.membership.arn}/*",
      aws_s3_bucket.backups.arn,
      "${aws_s3_bucket.backups.arn}/*",
    ]
  }

  statement {
    sid       = "SSMParameterRead"
    effect    = "Allow"
    actions   = ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"]
    resources = ["arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter${var.ssm_parameter_prefix}/*"]
  }

  statement {
    sid    = "CloudWatchAgent"
    effect = "Allow"
    actions = [
      "cloudwatch:PutMetricData",
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "ec2_least_privilege" {
  name   = "oei-least-privilege"
  role   = aws_iam_role.ec2.id
  policy = data.aws_iam_policy_document.ec2_least_privilege.json
}

resource "aws_iam_instance_profile" "ec2" {
  name = "oei-ec2-instance-profile"
  role = aws_iam_role.ec2.name
}
