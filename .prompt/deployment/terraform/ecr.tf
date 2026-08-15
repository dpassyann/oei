# ---------------------------------------------------------------------------
# Single ECR repository for the backend (`application-web`) container image,
# built and pushed by .github/workflows/deploy-app.yml.
#
# The frontend stays a static Angular build published to S3 + CloudFront
# (§11 of deploiement-aws.md) — no container, so no ECR repository for it.
# Postgres and Keycloak are pulled directly from their public upstream
# images (postgres:17, quay.io/keycloak/keycloak:25.0) in
# docker-compose.prod.yml — duplicating them into our own ECR would add
# storage cost and a mirroring job for no benefit.
# ---------------------------------------------------------------------------

resource "aws_ecr_repository" "backend" {
  name                 = "oei-backend"
  image_tag_mutability = "MUTABLE" # "latest" is retagged on every deploy (deploiement-aws.md §10.1)

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "oei-backend"
  }
}

# Keep the repository from growing unbounded: retain the 15 most recent
# images (covers well over a month of deploys at a few per day), expire the
# rest. "latest" and SHA tags are both regular tags here, so this simply
# ages out old commits' images.
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 15 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 15
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
