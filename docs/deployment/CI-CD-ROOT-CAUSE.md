# CI/CD Pipeline — Root Cause Analysis

Source: primarily Agent G's AWS/CI/CD audit, cross-checked against Agent H's security findings
where they overlap (secrets exposure, in particular). All claims below are grounded in specific
files; open items that could not be verified from a read-only sandbox pass are listed explicitly
rather than asserted.

## 1. Current pipeline state

- Three GitHub Actions workflows are relevant: `.github/workflows/deploy-app.yml` (backend
  build + push to ECR + SSM rollout to EC2), `.github/workflows/deploy-frontend.yml` (frontend
  build + S3/CloudFront), `.github/workflows/deploy-infra.yml` (Terraform), plus
  `.github/workflows/ci.yml` (push/PR test gate, never touches AWS — no `id-token` permission,
  no AWS credential step, confirmed by full read).
- Both `deploy-app.yml` and `deploy-frontend.yml` are **`workflow_dispatch`-only** as of commit
  `ba49daf` — auto-deploy on push to `main` is intentionally disabled. Deployment today is a
  manual trigger, not continuous delivery.
- The **manual deployment path** (an operator running Terraform directly:
  `terraform apply -var backend_release_id=...`) has worked according to the user. This exercises
  `.prompt/deployment/terraform/backend_deploy.tf`'s `local-exec` SSM rollout — functionally the
  same remote script that `deploy-app.yml`'s rollout job would run.
- The **GitHub Actions workflow path** (triggering `deploy-app.yml` directly) has **not** been
  confirmed to work and contains at least one concrete blocking defect (§2.1) that would very
  likely cause it to fail if triggered today, independent of the manual path's success.
- Toolchain versions are consistent across the board: Java 25 (Temurin) and Node 22 / pnpm
  11.22.0 are identical in `backend/pom.xml`, `ci.yml`, `deploy-app.yml`, `deploy-frontend.yml` —
  no version drift found.
- Both Docker base images (`maven:3.9-eclipse-temurin-25`, `eclipse-temurin:25-jre-alpine`) are
  genuinely multi-arch (verified via `docker manifest inspect`), and the runtime image + Caddy
  image both ship BusyBox `wget`, so the new docker-compose healthchecks can execute.
- IAM (`github_oidc.tf`, `iam.tf`) is scoped fairly precisely to what the workflows actually
  call: ECR push/pull scoped to the single backend repo ARN, SSM `SendCommand` scoped to the
  exact instance ARN + document ARN, GitHub OIDC trust policy scoped to the actual repo
  (`dpassyann/oei`, matches `git remote -v`).

## 2. Concrete root causes found (each backed by a file reference)

### 2.1 Missing QEMU registration breaks the new arm64 cross-build — CRITICAL, most likely failure if triggered today
`deploy-app.yml`'s new arm64 build step adds `docker/setup-buildx-action@v3` but **never adds
`docker/setup-qemu-action@v3`** (or equivalent binfmt registration). GitHub-hosted `ubuntu-latest`
runners are amd64; cross-building `--platform linux/arm64` with buildx on an amd64 host requires
QEMU user-mode emulation to execute the arm64 `RUN` instructions inside the Dockerfile build
stage (`RUN mvn ... package`, `RUN java -Djarmode=tools ... extract`). `setup-buildx-action` only
installs the buildx CLI/builder instance — it does **not** register binfmt_misc handlers.
Verified by grepping `deploy-app.yml`: only `setup-buildx-action` appears, `setup-qemu-action`
does not. Without it, the build will almost certainly fail with the same class of error
(`exec format error`) the arm64 fix is meant to solve, just moved from EC2 runtime into the CI
build step.
— File: `/Users/ydeungoue/projects/oei/.github/workflows/deploy-app.yml`

### 2.2 SSM rollout script depends on undocumented manual EC2 state, not Terraform-managed state
`deploy-app.yml`'s SSM rollout script assumes a pre-existing git checkout of the repo on the EC2
instance (it loops over `/home/ec2-user/oei`, `/home/oei-deploy/oei`, `/root/oei`, then runs
`git fetch --all --prune && git reset --hard origin/main`). But Terraform's only provisioning of
the instance, `user_data.sh.tftpl`, only runs `dnf install -y docker` + installs the compose
plugin — it **never installs git, never clones the repo, and never creates any of those three
candidate directories**. The working git checkout on the instance today is undocumented-in-IaC
manual state left over from the operator's earlier manual deploy. If the EC2 instance is ever
replaced (e.g. after a Terraform-driven recreate), the pipeline will fail at "Could not find the
oei deployment directory on the instance" or at a missing `git` binary.
— Files: `/Users/ydeungoue/projects/oei/.github/workflows/deploy-app.yml`,
`/Users/ydeungoue/projects/oei/.prompt/deployment/terraform/templates/user_data.sh.tftpl`

### 2.3 Runtime secrets are only partially managed by Terraform — `terraform apply` alone cannot reproduce the environment
Several env vars required by `infra/docker-compose.prod.yml` (`OEI_USER`, `OEI_PASSWORD`,
`OEI_APP_PASSWORD`, `POSTGRES_DB`, `OEI_OIDC_ISSUER_URI`, `OEI_ECR_REGISTRY`, `OEI_IMAGE_TAG`,
`GRAFANA_BASICAUTH_USER`, `GRAFANA_BASICAUTH_PASSWORD_HASH`, `GRAFANA_ADMIN_PASSWORD`) have **no
corresponding `aws_ssm_parameter` resource anywhere** in `.prompt/deployment/terraform/*.tf` —
only `OEI_SMTP_*` and `OEI_MAIL_FROM` are Terraform-managed (`ses.tf`). `fetch-secrets.sh` must
be pulling the rest from SSM parameters created manually, outside Terraform state — so a
from-scratch `terraform apply` cannot reproduce a working environment.
— Files: `/Users/ydeungoue/projects/oei/infra/docker-compose.prod.yml`,
`/Users/ydeungoue/projects/oei/.prompt/deployment/terraform/ses.tf`,
`/Users/ydeungoue/projects/oei/.prompt/deployment/terraform/iam.tf`

### 2.4 (Security cross-check, Agent H) Secret-looking files are untracked and unprotected by `.gitignore`
This is not itself a pipeline defect, but it directly threatens pipeline/secret integrity and
was independently corroborated by both the CI/CD audit (file inventory) and the security audit
(gitignore review): `oei-prod-key.pem` (repo root), `.prompt/local/oei-prod-secrets.txt`, and
`.prompt/local/oei-prod.env` are all untracked (`??` in `git status`) and `git check-ignore -v`
returns nothing for all three. The existing `.gitignore` only excludes the literal filename
`.env` and `*.local.env` — not `oei-prod.env`, not `oei-prod-secrets.txt`, not `*.pem`. A plain
`git add -A` (which some contributors may run without checking `git status` first) would stage
and could commit a production private key and prod secrets/env values directly into git
history, which would then need to flow through the exact CI/CD pipeline being fixed here —
compounding the blast radius of any future accidental push.
— Files: `/Users/ydeungoue/projects/oei/oei-prod-key.pem`,
`/Users/ydeungoue/projects/oei/.prompt/local/oei-prod-secrets.txt`,
`/Users/ydeungoue/projects/oei/.prompt/local/oei-prod.env`,
`/Users/ydeungoue/projects/oei/.gitignore`

## 3. What the uncommitted diff already fixes

Per the working-tree diff (`.github/workflows/deploy-app.yml`,
`.prompt/deployment/terraform/variables.tf`, `infra/Caddyfile`, `infra/docker-compose.prod.yml`)
and the new untracked `infra/scripts/health-check-prod.sh`:

- `deploy-app.yml` was switched to `workflow_dispatch`-only (auto-deploy on push disabled) and
  gained the arm64 cross-build step (buildx) intended to fix an EC2 arm64 runtime mismatch — this
  is the fix that introduced the QEMU gap in §2.1; the underlying arm64/amd64 mismatch problem it
  targets is real and addressed in intent, just incomplete in execution.
- `infra/Caddyfile` gained `admin 0.0.0.0:2019` + the `metrics` global directive, and a
  `/caddy-health` handle block — internally consistent, so the new Caddy healthcheck hitting
  `localhost:2019/metrics` will resolve as intended.
- `infra/docker-compose.prod.yml` gained healthchecks (`wget --spider .../actuator/health`,
  `.../metrics`) that will actually execute, since both the backend runtime image and the Caddy
  image ship BusyBox `wget` (verified via `docker manifest inspect` / image inspection).
- `.prompt/deployment/terraform/variables.tf` and the new `backend_deploy.tf` wire
  `backend_release_id` through to the local-exec SSM rollout used by the manual deployment path
  that the user confirmed already works.
- `infra/scripts/health-check-prod.sh` (new, untracked) is a solid smoke-test script covering
  CloudFront/SPA deep links, backend actuator health, CORS, and Keycloak health/OIDC discovery —
  not yet wired into any workflow as a post-deploy verification job, but ready to be.

## 4. What remains to fix before the pipeline can be trusted

In order of blocking severity:

1. **Add `docker/setup-qemu-action@v3` before `docker/setup-buildx-action@v3`** in
   `deploy-app.yml`'s build-and-push job. This is the one concrete change required for the
   stated arm64 goal to actually work in GitHub Actions (§2.1). Without it, triggering the
   workflow will very likely reproduce the same `exec format error` class of failure it was
   meant to eliminate.
2. **Remove the git-checkout dependency from the EC2 rollout, or make it Terraform-managed.**
   Either (a) have Terraform's `user_data.sh.tftpl` provision git and clone the initial checkout
   so instance replacement is safe, or (b) change the rollout script to not depend on a git
   checkout at all (e.g. deploy purely via the already-pushed container image + an explicit
   compose file transferred by the pipeline, with no `git` dependency on the instance) (§2.2).
3. **Bring the remaining runtime secrets under Terraform-managed `aws_ssm_parameter` resources**
   (`OEI_USER`, `OEI_PASSWORD`, `OEI_APP_PASSWORD`, `POSTGRES_DB`, `OEI_OIDC_ISSUER_URI`,
   `OEI_ECR_REGISTRY`, `OEI_IMAGE_TAG`, `GRAFANA_*`), matching the existing `OEI_SMTP_*` pattern
   in `ses.tf`, so a from-scratch `terraform apply` is actually reproducible (§2.3).
4. **Fix the secrets-hygiene gap** (§2.4): add `.gitignore` rules for `oei-prod*.pem`,
   `oei-prod*.env`, `oei-prod*secrets*` immediately, and verify via
   `git log --all --source -- oei-prod-key.pem` (and equivalents for the other two files) that
   none has ever actually been committed. If any has, treat it as a live incident: rotate the
   credential/key and consider a history rewrite.
5. **Verify GitHub repo/environment configuration actually exists** — `AWS_DEPLOY_ROLE_ARN`,
   `AWS_REGION`, `FRONTEND_S3_BUCKET`, `FRONTEND_CLOUDFRONT_DISTRIBUTION_ID` — via
   `gh variable list` against the real repo (could not be verified from the sandbox; `gh` auth
   returned 401 there).
6. **Confirm whether `dpassyann/oei` is public or private on GitHub.** If private, the EC2
   instance's `git fetch` (assuming git and a checkout exist at all — see item 2) needs
   credentials that are not provisioned anywhere in Terraform or `user_data.sh.tftpl`; this must
   be resolved as part of item 2, not left as an undocumented manual step.
7. **Wire `infra/scripts/health-check-prod.sh` into `deploy-app.yml`/`deploy-frontend.yml`** as a
   final post-deploy verification job, now that the script exists and covers the right surface
   (CloudFront, backend health, CORS, Keycloak/OIDC).

## 5. Recommended next steps, in order

1. Fix §4.1 (QEMU) — smallest change, unblocks the actual stated goal of the current diff.
2. Fix §4.4 (secrets hygiene) — zero-cost, highest-consequence-if-ignored; do this before any
   further commits touch this repo, regardless of pipeline work.
3. Resolve §4.5/§4.6 (verify GitHub Actions secrets/variables and repo visibility) before the
   first real trigger of `deploy-app.yml` via Actions — otherwise failure diagnosis will be
   ambiguous (auth failure vs. QEMU vs. missing checkout, all present at once).
4. Fix §4.2 (git-checkout dependency) — do this before ever replacing/recreating the EC2
   instance, since that is the trigger condition for this failure mode.
5. Fix §4.3 (Terraform-manage remaining secrets) — needed for disaster-recovery reproducibility,
   not blocking for day-to-day deploys as long as the existing manually-created SSM parameters
   remain in place.
6. Wire in the health-check script (§4.7) as the final hardening step once the above are done,
   to get automated post-deploy confidence going forward.

## Cross-reference to security audit (Agent H)

Beyond the shared secrets-hygiene finding in §2.4, Agent H's security audit also flags
infrastructure-adjacent items that affect deployment trust but were out of this document's
primary scope: Caddy security headers are applied only to the `grafana.` vhost (not
`api.`/`auth.`), and the Caddy admin API (`0.0.0.0:2019`, no auth) reachability from outside the
docker-compose internal network in the actual AWS deployment could not be verified from the
compose file alone. Both are tracked in
`/Users/ydeungoue/projects/oei/docs/audit/MEMBER-SPACE-CURRENT-STATE.md` §7 and should be
reviewed alongside the CI/CD fixes above rather than treated as a separate workstream, since
the Caddyfile is part of the same uncommitted diff (§3).
