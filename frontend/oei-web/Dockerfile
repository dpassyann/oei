# syntax=docker/dockerfile:1
#
# Multi-stage build for the Angular 22 SPA `oei-web`, consistent with
# `.prompt/deployment/deploiement-aws.md` §8.2 (`infra/docker/frontend.Dockerfile`).
#
# Difference with the repo-root-context variant documented there: this Dockerfile is
# self-contained under `frontend/oei-web/`, so the build context is this directory itself
# (no monorepo-wide COPY needed, since the frontend is a single pnpm package, not a Maven
# reactor):
#
#   cd frontend/oei-web
#   docker build -t oei-frontend:latest .
#
# Runtime notes (see deploiement-aws.md §8.2 and §11):
# - In production, the built `dist/` is pushed to S3 and served by CloudFront — the Nginx
#   stage below is NOT deployed on the production EC2 instance.
# - It remains useful for local/staging parity (PR preview, docker-compose recette) where a
#   full Docker Compose environment without AWS is desirable. Stage 1 (Node/pnpm build) is
#   exactly the artifact producer reused in production (S3 sync); only stage 2 differs.

########################################
# Stage 1: build (Node + pnpm, Angular) #
########################################
# Node version aligned with the frontend/backend Dockerfile conventions already documented
# in .prompt/deployment/deploiement-aws.md (node:22-alpine). No .nvmrc is committed in this
# project; Angular CLI 22 requires Node >= 20.19, so 22 LTS is a safe, forward-looking pin.
FROM node:22-alpine AS build
WORKDIR /workspace

# Pin pnpm to the exact version declared in package.json ("packageManager": "pnpm@10.33.0"),
# via Corepack rather than a global npm install, so the build always uses the same pnpm
# release as local development.
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Cache pnpm's dependency resolution: copy only the manifest + lockfile + .npmrc first, so
# `pnpm install` is re-run only when a dependency actually changes, not on every source edit.
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile

# Full source, real build. `pnpm run build` already runs
# `node scripts/copy-content-assets.mjs` first (see package.json), then `ng build` in its
# default "production" configuration (see angular.json) — optimized, hashed asset filenames.
COPY . .
RUN pnpm run build

#####################################################
# Stage 2: Nginx — local/staging parity usage only   #
#####################################################
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Output of the Angular 22 build (new @angular/build builder): the browser bundle lives
# under dist/oei-web/browser (see angular.json's "outputPath" for this project, root: "").
COPY --from=build /workspace/dist/oei-web/browser /usr/share/nginx/html

EXPOSE 8080
