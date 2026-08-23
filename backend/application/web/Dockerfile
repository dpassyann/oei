# syntax=docker/dockerfile:1
#
# Multi-stage build for the executable Spring Boot module `application-web`,
# per deploiement-aws.md §8.1. Build context MUST be the `backend/` directory
# (not the repo root), since every COPY below is relative to the Maven
# reactor root:
#
#   docker build -f application/web/Dockerfile -t oei-backend:latest backend/
#
# (deploy-app.yml invokes it exactly this way.)

########################
# Stage 1: Maven build  #
########################
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /workspace

# Cache Maven dependencies: copy every module's pom.xml (including the
# reactor aggregators domain/pom.xml and infrastructure/pom.xml) before any
# source, so `dependency:go-offline` can populate the local repo without the
# application code invalidating this layer on every commit.
COPY pom.xml .
COPY checkstyle.xml checkstyle-suppressions.xml ./
COPY domain/pom.xml domain/pom.xml
COPY domain/shared/pom.xml domain/shared/pom.xml
COPY domain/core/pom.xml domain/core/pom.xml
COPY infrastructure/pom.xml infrastructure/pom.xml
COPY infrastructure/security/pom.xml infrastructure/security/pom.xml
COPY infrastructure/persistence/pom.xml infrastructure/persistence/pom.xml
COPY infrastructure/wiring/pom.xml infrastructure/wiring/pom.xml
COPY application/pom.xml application/pom.xml
COPY application/web/pom.xml application/web/pom.xml
COPY test/architecture/pom.xml test/architecture/pom.xml
COPY test/acceptance/pom.xml test/acceptance/pom.xml
RUN mvn -B -q dependency:go-offline || true

# Full source, real build. Tests are skipped here on purpose: they already
# run in ci.yml on every push/PR to main, and this build only runs when a
# human explicitly triggers deploy-app.yml — re-running the full suite here
# would just slow down an already-approved deploy.
COPY domain domain
COPY infrastructure infrastructure
COPY application application
COPY test test
RUN mvn -B clean package -DskipTests -pl application/web -am

# Extract Spring Boot layers so runtime image can copy exploded layers (smaller deltas).
RUN java -Djarmode=tools -jar /workspace/application/web/target/application-web-*-exec.jar \
	extract --layers --launcher --destination /workspace/extracted

#################################
# Stage 2: runtime (minimal JRE) #
#################################
# eclipse-temurin publishes multi-arch (amd64/arm64) images: the same
# Dockerfile builds locally on Apple Silicon/Intel and matches the t4g.large
# (Graviton/ARM64) production instance without modification.
FROM eclipse-temurin:25-jre-alpine AS runtime

RUN addgroup -S oei && adduser -S oei -G oei
WORKDIR /app
USER oei

COPY --from=build --chown=oei:oei /workspace/extracted/dependencies/ ./
COPY --from=build --chown=oei:oei /workspace/extracted/spring-boot-loader/ ./
COPY --from=build --chown=oei:oei /workspace/extracted/snapshot-dependencies/ ./
COPY --from=build --chown=oei:oei /workspace/extracted/application/ ./

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx768m", "-XX:+UseSerialGC", "org.springframework.boot.loader.launch.JarLauncher"]
