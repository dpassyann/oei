output "ec2_public_ip" {
  description = "Elastic IP of the EC2 instance (used for api./auth. DNS records)."
  value       = aws_eip.app.public_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID."
  value       = aws_instance.app.id
}

output "s3_public_bucket_arn" {
  description = "ARN of the oei-public bucket."
  value       = aws_s3_bucket.public.arn
}

output "s3_membership_bucket_arn" {
  description = "ARN of the oei-membership bucket."
  value       = aws_s3_bucket.membership.arn
}

output "s3_backups_bucket_arn" {
  description = "ARN of the oei-backups bucket."
  value       = aws_s3_bucket.backups.arn
}

output "s3_web_static_bucket_arn" {
  description = "ARN of the oei-web-static bucket."
  value       = aws_s3_bucket.web_static.arn
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (needed for cache invalidations after each frontend deploy)."
  value       = aws_cloudfront_distribution.web.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (*.cloudfront.net)."
  value       = aws_cloudfront_distribution.web.domain_name
}

output "acm_certificate_arn" {
  description = "ARN of the validated ACM certificate used by CloudFront."
  value       = aws_acm_certificate_validation.web.certificate_arn
}

output "iam_instance_profile_name" {
  description = "Name of the EC2 IAM instance profile."
  value       = aws_iam_instance_profile.ec2.name
}

output "security_group_id" {
  description = "ID of the EC2 Security Group."
  value       = aws_security_group.app.id
}

output "route53_zone_id" {
  description = "Hosted zone ID used for DNS records."
  value       = data.aws_route53_zone.primary.zone_id
}

output "github_actions_deploy_role_arn" {
  description = "ARN of the OIDC-federated IAM role assumed by GitHub Actions (deploy-infra.yml, deploy-app.yml). Set this once as the GitHub repository variable AWS_DEPLOY_ROLE_ARN — see pipeline-github-actions.md."
  value       = aws_iam_role.github_actions_deploy.arn
}

output "ecr_backend_repository_url" {
  description = "URL of the ECR repository holding the oei-backend image, used by deploy-app.yml to push/pull and by docker-compose.prod.yml's `backend.image`."
  value       = aws_ecr_repository.backend.repository_url
}
