# Default provider: applicative region (Paris by default, see variables.tf).
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.common_tags
  }
}

# CloudFront requires ACM certificates to be requested in us-east-1, regardless
# of the region the rest of the infrastructure lives in (see deploiement-aws.md, §11.2).
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = var.common_tags
  }
}
