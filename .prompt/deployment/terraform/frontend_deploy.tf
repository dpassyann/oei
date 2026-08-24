# Manual frontend publish hook executed through Terraform.
#
# This is intentionally opt-in: nothing runs unless `frontend_release_id` is set
# to a non-empty value, and each new value triggers one publish.

resource "terraform_data" "frontend_publish" {
  count = var.frontend_release_id == "" ? 0 : 1

  input = {
    release_id = var.frontend_release_id
    bucket     = aws_s3_bucket.web_static.id
    dist_id    = aws_cloudfront_distribution.web.id
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-ec"]
    command     = <<-EOT
      cd "${path.module}/../../../backend"
      mvn -B -pl application/web -am package -DskipTests -Dstyle.color=never
      cd "${path.module}/../../../frontend/oei-web"
      pnpm run build:api
      aws s3 sync dist/oei-web/browser "s3://${aws_s3_bucket.web_static.id}" --delete --cache-control "public,max-age=31536000,immutable" --exclude "index.html"
      aws s3 cp dist/oei-web/browser/index.html "s3://${aws_s3_bucket.web_static.id}/index.html" --cache-control "no-cache"
      aws cloudfront create-invalidation --distribution-id "${aws_cloudfront_distribution.web.id}" --paths "/*"
    EOT
  }
}
