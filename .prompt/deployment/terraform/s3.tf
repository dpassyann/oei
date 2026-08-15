# ---------------------------------------------------------------------------
# oei-public — MinIO's public bucket replacement. Read-only public access via
# bucket policy, never public write (deploiement-aws.md §6).
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "public" {
  bucket = var.s3_public_bucket_name

  tags = {
    Name = var.s3_public_bucket_name
  }
}

resource "aws_s3_bucket_versioning" "public" {
  bucket = aws_s3_bucket.public.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "public" {
  bucket = aws_s3_bucket.public.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "public" {
  bucket = aws_s3_bucket.public.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "public_bucket_policy" {
  statement {
    sid       = "PublicReadOnly"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.public.arn}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "public" {
  bucket     = aws_s3_bucket.public.id
  policy     = data.aws_iam_policy_document.public_bucket_policy.json
  depends_on = [aws_s3_bucket_public_access_block.public]
}

# ---------------------------------------------------------------------------
# oei-membership — sensitive membership documents (CVs, dues...), strictly
# private, only ever accessed via the authenticated backend.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "membership" {
  bucket = var.s3_membership_bucket_name

  tags = {
    Name = var.s3_membership_bucket_name
  }
}

resource "aws_s3_bucket_versioning" "membership" {
  bucket = aws_s3_bucket.membership.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "membership" {
  bucket = aws_s3_bucket.membership.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "membership" {
  bucket = aws_s3_bucket.membership.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

# ---------------------------------------------------------------------------
# oei-backups — EBS/pg_dump backups, strictly private, lifecycle transitions
# to cheaper storage classes then expiration (deploiement-aws.md §6.4, §13.2).
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "backups" {
  bucket = var.s3_backups_bucket_name

  tags = {
    Name = var.s3_backups_bucket_name
  }
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "archive-old-backups"
    status = "Enabled"

    filter {
      prefix = ""
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }

    expiration {
      days = 365
    }
  }

  depends_on = [aws_s3_bucket_versioning.backups]
}

# ---------------------------------------------------------------------------
# oei-web-static — built Angular frontend, private bucket, only readable by
# CloudFront through an Origin Access Control (deploiement-aws.md §11.1).
# The bucket policy granting CloudFront read access lives in cloudfront.tf,
# since it references the distribution ARN.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "web_static" {
  bucket = var.s3_web_static_bucket_name

  tags = {
    Name = var.s3_web_static_bucket_name
  }
}

resource "aws_s3_bucket_versioning" "web_static" {
  bucket = aws_s3_bucket.web_static.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "web_static" {
  bucket = aws_s3_bucket.web_static.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "web_static" {
  bucket = aws_s3_bucket.web_static.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}
