#!/usr/bin/env bash
# Creates the "oei" application database and its "oei_app" role, separate from the
# "keycloak" database/role used by Keycloak (${POSTGRES_DB}/${OEI_USER}), which this
# script never touches. Runs once, automatically, via postgres' own
# /docker-entrypoint-initdb.d convention (only on first container init / empty data
# volume) — see backend/README.md "Local database" for how the Spring Boot backend
# consumes it. Idempotent so it is also safe to run manually against an existing volume.
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<-SQL
    DO
    \$\$
    BEGIN
       IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'oei_app') THEN
          CREATE ROLE oei_app LOGIN PASSWORD '${OEI_APP_PASSWORD}';
       END IF;
    END
    \$\$;
SQL

OEI_DB_EXISTS=$(psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" -tAc \
    "SELECT 1 FROM pg_database WHERE datname = 'oei'")

if [ "${OEI_DB_EXISTS}" != "1" ]; then
    psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" \
        -c "CREATE DATABASE oei OWNER oei_app;"
fi

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "oei" \
    -c "GRANT ALL PRIVILEGES ON DATABASE oei TO oei_app;"
