# Manual backend rollout hook executed through Terraform via SSM Run Command.
#
# This is intentionally opt-in: nothing runs unless `backend_release_id` is set
# to a non-empty value, and each new value triggers one rollout.
#
# What it does on the EC2 instance (via SSM):
#   1. Locate the OEI deployment directory.
#   2. Refresh the local .env from SSM (fetch-secrets.sh).
#   3. Login to ECR and pull the latest backend image.
#   4. Recreate only the backend container (no downtime for postgres/keycloak).
#   5. Tail the last 60 log lines so any startup error surfaces immediately.
#   6. Wait for the Spring Boot actuator /health to return UP.
#
# Usage:
#   terraform apply -var='backend_release_id=<git-sha-or-timestamp>'

resource "terraform_data" "backend_rollout" {
  count = var.backend_release_id == "" ? 0 : 1

  input = {
    release_id  = var.backend_release_id
    instance_id = aws_instance.app.id
    aws_region  = var.aws_region
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-ec"]
    command     = <<-EOT
      set -euo pipefail

      INSTANCE_ID="${aws_instance.app.id}"
      AWS_REGION="${var.aws_region}"

      echo "==> Sending SSM rollout command to $INSTANCE_ID ..."

      # Build the remote script then send it via SSM Run Command.
      # All bash $${VAR} expansions are escaped so Terraform does not
      # try to interpolate them — only the three Terraform variables
      # above are expanded at plan/apply time.
      REMOTE_SCRIPT=$(cat <<'REMOTE'
set -euo pipefail

# ── 1. Locate deploy directory ───────────────────────────────────────────────
DEPLOY_DIR=""
for candidate in /home/ec2-user/oei /home/oei-deploy/oei /root/oei; do
  if [ -f "$candidate/infra/docker-compose.prod.yml" ]; then
    DEPLOY_DIR="$candidate"
    break
  fi
done
if [ -z "$DEPLOY_DIR" ]; then
  echo "ERROR: could not find the OEI deploy directory" >&2
  exit 1
fi
echo "Deploy dir: $DEPLOY_DIR"
cd "$DEPLOY_DIR"

# ── 2. git pull latest (if this is a git checkout) ───────────────────────────
if [ -d .git ]; then
  git fetch --all --prune
  git reset --hard origin/main
  echo "git reset done"
fi

cd infra

# ── 3. Refresh .env from SSM Parameter Store ─────────────────────────────────
if [ -x ./scripts/fetch-secrets.sh ]; then
  ./scripts/fetch-secrets.sh .env
  echo ".env refreshed from SSM"
elif [ ! -f .env ]; then
  echo "ERROR: missing infra/.env and no fetch-secrets.sh" >&2
  exit 1
fi

# ── 4. ECR login ──────────────────────────────────────────────────────────────
REGION=$(aws configure get region 2>/dev/null || echo "eu-west-3")
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_HOST="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$ECR_HOST"
echo "ECR login OK"

# ── 5. Pull + recreate backend container only ─────────────────────────────────
docker compose -f docker-compose.prod.yml --env-file .env pull backend
docker compose -f docker-compose.prod.yml --env-file .env up -d --no-deps backend
docker image prune -f
echo "Backend container recreated"

# ── 6. Tail logs for initial startup visibility ───────────────────────────────
sleep 10
echo "--- backend logs (last 60 lines) ---"
docker compose -f docker-compose.prod.yml logs --tail=60 backend || true

# ── 7. Health probe (30 attempts x 5 s = 2.5 min max) ────────────────────────
echo "Waiting for /actuator/health ..."
for i in $(seq 1 30); do
  HTTP_CODE=$(docker compose -f docker-compose.prod.yml exec -T backend \
    wget --quiet --server-response --spider \
    http://localhost:8080/actuator/health 2>&1 \
    | grep "HTTP/" | awk '{print $2}' || echo "")
  if [ "$HTTP_CODE" = "200" ]; then
    echo "Backend is UP (attempt $i)"
    exit 0
  fi
  echo "Attempt $i/30: not ready yet (got '$HTTP_CODE'), retrying in 5s ..."
  sleep 5
done
echo "ERROR: backend did not become healthy in time" >&2
docker compose -f docker-compose.prod.yml logs --tail=100 backend >&2 || true
exit 1
REMOTE
      )

      jq -n --arg script "$REMOTE_SCRIPT" '{commands: [$script]}' \
        > /tmp/oei-ssm-backend-params.json

      COMMAND_ID=$(aws ssm send-command \
        --region "$AWS_REGION" \
        --instance-ids "$INSTANCE_ID" \
        --document-name "AWS-RunShellScript" \
        --comment "terraform backend_rollout: ${var.backend_release_id}" \
        --parameters file:///tmp/oei-ssm-backend-params.json \
        --query "Command.CommandId" \
        --output text)

      echo "==> SSM Command ID: $COMMAND_ID"
      echo "==> Waiting for completion (up to 3 min) ..."

      aws ssm wait command-executed \
        --region "$AWS_REGION" \
        --command-id "$COMMAND_ID" \
        --instance-id "$INSTANCE_ID" || true

      echo "--- stdout ---"
      aws ssm get-command-invocation \
        --region "$AWS_REGION" \
        --command-id "$COMMAND_ID" \
        --instance-id "$INSTANCE_ID" \
        --query "StandardOutputContent" --output text || true

      echo "--- stderr ---"
      aws ssm get-command-invocation \
        --region "$AWS_REGION" \
        --command-id "$COMMAND_ID" \
        --instance-id "$INSTANCE_ID" \
        --query "StandardErrorContent" --output text || true

      FINAL_STATUS=$(aws ssm get-command-invocation \
        --region "$AWS_REGION" \
        --command-id "$COMMAND_ID" \
        --instance-id "$INSTANCE_ID" \
        --query "Status" --output text)

      echo "==> SSM command finished with status: $FINAL_STATUS"
      if [ "$FINAL_STATUS" != "Success" ]; then
        echo "ERROR: backend rollout failed - see stderr above." >&2
        exit 1
      fi
      echo "==> Backend rollout complete"
    EOT
  }
}
