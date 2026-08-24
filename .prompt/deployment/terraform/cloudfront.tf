# CDN in front of the private oei-web-static S3 bucket, using an Origin
# Access Control (OAC) — the modern replacement for the deprecated Origin
# Access Identity (OAI) — so the bucket itself never needs to be public
# (deploiement-aws.md §11).

resource "aws_cloudfront_origin_access_control" "web" {
  name                              = "oei-web-oac"
  description                       = "OAC for oei-web-static"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "web" {
  comment             = "OEI frontend statique"
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  origin {
    domain_name              = aws_s3_bucket.web_static.bucket_regional_domain_name
    origin_id                = "oei-web-static-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.web.id
  }

  default_cache_behavior {
    target_origin_id       = "oei-web-static-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Managed cache policy "CachingOptimized" (id constant across all AWS
    # accounts), matches deploiement-aws.md §11.2 exactly.
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  # 404 -> index.html (200): reproduces the Angular SPA client-side routing
  # fallback without an application server (deploiement-aws.md §11.2).
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  # S3 private origins return 403 AccessDenied for missing keys; map it to the
  # SPA entry point as well so direct deep-links (/certifications, etc.) load.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.web.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "oei-web-static"
  }
}

# Bucket policy granting CloudFront (via this specific distribution's OAC)
# read access to oei-web-static — the bucket itself stays fully private.
data "aws_iam_policy_document" "web_static_cloudfront" {
  statement {
    sid       = "AllowCloudFrontServicePrincipalReadOnly"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.web_static.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.web.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "web_static" {
  bucket = aws_s3_bucket.web_static.id
  policy = data.aws_iam_policy_document.web_static_cloudfront.json
}
