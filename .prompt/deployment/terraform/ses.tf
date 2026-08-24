# ---------------------------------------------------------------------------
# Amazon SES for production account-lifecycle emails (Keycloak) and backend
# transactional emails.
#
# Account registration/verification emails are sent by Keycloak, not by the
# Spring backend. Production therefore needs BOTH:
#   1) a verified SES identity with DNS records (TXT/CNAME/MX/SPF), and
#   2) SMTP credentials exposed to the runtime via SSM Parameter Store.
# ---------------------------------------------------------------------------

variable "smtp_from_email" {
  description = "Verified sender address used by backend and Keycloak production emails. Must belong to domain_name."
  type        = string
  default     = "no-reply@theitorder.global"

  validation {
    condition     = can(regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", var.smtp_from_email))
    error_message = "smtp_from_email must look like a valid email address."
  }
}

variable "ses_mail_from_subdomain" {
  description = "Subdomain used for SES custom MAIL FROM (feedback/bounce path), created under domain_name."
  type        = string
  default     = "mail"
}

locals {
  ses_mail_from_domain = "${var.ses_mail_from_subdomain}.${var.domain_name}"
}

resource "aws_ses_domain_identity" "primary" {
  domain = var.domain_name
}

resource "aws_route53_record" "ses_verification" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = "_amazonses.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = [aws_ses_domain_identity.primary.verification_token]
}

resource "aws_ses_domain_identity_verification" "primary" {
  domain     = aws_ses_domain_identity.primary.id
  depends_on = [aws_route53_record.ses_verification]
}

resource "aws_ses_domain_dkim" "primary" {
  domain = aws_ses_domain_identity.primary.domain
}

resource "aws_route53_record" "ses_dkim" {
  count = 3

  zone_id = data.aws_route53_zone.primary.zone_id
  name    = "${aws_ses_domain_dkim.primary.dkim_tokens[count.index]}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.primary.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

resource "aws_ses_domain_mail_from" "primary" {
  domain                 = aws_ses_domain_identity.primary.domain
  mail_from_domain       = local.ses_mail_from_domain
  behavior_on_mx_failure = "UseDefaultValue"
}

resource "aws_route53_record" "ses_mail_from_mx" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = aws_ses_domain_mail_from.primary.mail_from_domain
  type    = "MX"
  ttl     = 600
  records = ["10 feedback-smtp.${var.aws_region}.amazonses.com"]
}

resource "aws_route53_record" "ses_mail_from_spf" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = aws_ses_domain_mail_from.primary.mail_from_domain
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com -all"]
}

resource "aws_iam_user" "ses_smtp" {
  name = "oei-ses-smtp"

  tags = {
    Name = "oei-ses-smtp"
  }
}

resource "aws_iam_access_key" "ses_smtp" {
  user = aws_iam_user.ses_smtp.name
}

data "aws_iam_policy_document" "ses_smtp_send" {
  statement {
    sid       = "AllowSesSendRawEmail"
    effect    = "Allow"
    actions   = ["ses:SendRawEmail"]
    resources = ["*"]
  }
}

resource "aws_iam_user_policy" "ses_smtp_send" {
  name   = "oei-ses-smtp-send"
  user   = aws_iam_user.ses_smtp.name
  policy = data.aws_iam_policy_document.ses_smtp_send.json
}

resource "aws_ssm_parameter" "smtp_host" {
  name      = "${var.ssm_parameter_prefix}/OEI_SMTP_HOST"
  type      = "String"
  value     = "email-smtp.${var.aws_region}.amazonaws.com"
  overwrite = true
}

resource "aws_ssm_parameter" "smtp_port" {
  name      = "${var.ssm_parameter_prefix}/OEI_SMTP_PORT"
  type      = "String"
  value     = "587"
  overwrite = true
}

resource "aws_ssm_parameter" "smtp_username" {
  name      = "${var.ssm_parameter_prefix}/OEI_SMTP_USERNAME"
  type      = "SecureString"
  value     = aws_iam_access_key.ses_smtp.id
  overwrite = true
}

resource "aws_ssm_parameter" "smtp_password" {
  name      = "${var.ssm_parameter_prefix}/OEI_SMTP_PASSWORD"
  type      = "SecureString"
  value     = aws_iam_access_key.ses_smtp.ses_smtp_password_v4
  overwrite = true
}

resource "aws_ssm_parameter" "mail_from" {
  name      = "${var.ssm_parameter_prefix}/OEI_MAIL_FROM"
  type      = "String"
  value     = var.smtp_from_email
  overwrite = true
}

