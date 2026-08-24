#!/usr/bin/env python3
import json
from pathlib import Path

LOCAL_COMPOSE = Path('/Users/ydeungoue/projects/oei/infra/docker-compose.prod.yml')
OUTPUT = Path('/tmp/ssm-replace-compose-params.json')

compose_lines = LOCAL_COMPOSE.read_text().splitlines()
commands = [
    'set -euo pipefail',
    'cd /home/ec2-user/oei/infra',
    "cat > docker-compose.prod.yml <<'EOF'",
]
commands.extend(compose_lines)
commands.append('EOF')
commands.extend([
    "grep -q '^GRAFANA_ADMIN_USER=' .env || echo 'GRAFANA_ADMIN_USER=admin' >> .env",
    "grep -q '^GRAFANA_ADMIN_PASSWORD=' .env || echo 'GRAFANA_ADMIN_PASSWORD=AKqEnxCMHRR2Qbe0VggSWwF7biSay3UV' >> .env",
    "grep -q '^GRAFANA_BASICAUTH_USER=' .env || echo 'GRAFANA_BASICAUTH_USER=admin' >> .env",
    "grep -q '^GRAFANA_BASICAUTH_PASSWORD_HASH=' .env || echo \"GRAFANA_BASICAUTH_PASSWORD_HASH='$2a$14$/1A0B1xSWhL12d3j9sJvkuS/2k5DS1q4vZG8hEkYu22I7mL0lyUAa'\" >> .env",
    'docker compose -f docker-compose.prod.yml --env-file .env config >/tmp/compose-validate.out',
    'docker compose -f docker-compose.prod.yml --env-file .env up -d',
    'docker compose -f docker-compose.prod.yml --env-file .env --profile obs up -d',
    'docker compose -f docker-compose.prod.yml --env-file .env ps',
])

OUTPUT.write_text(json.dumps({'commands': commands}))
print(str(OUTPUT))

