# Single Security Group for the EC2 instance (deploiement-aws.md §5.1):
# - 443/80 open to the world (Caddy terminates TLS and handles the ACME
#   HTTP-01 challenge / HTTP->HTTPS redirect).
# - 22 restricted to the operator's CIDR.
# No other inbound rule: Postgres, Keycloak and the backend are never
# published on the host (no `ports:` for them in docker-compose.prod.yml),
# they only communicate over the internal Docker network `oei-net`.
#
# A second, "internal-only" Security Group was considered (per the task
# brief) to model Postgres/Keycloak access, but is intentionally NOT created:
# AWS Security Groups filter traffic at the ENI level, they have no visibility
# into Docker's internal bridge network `oei-net`, so a SG modeling
# "internal-only" access to those services would be a no-op — the manual's
# own defense-in-depth for that boundary is `ufw` + the `DOCKER-USER` chain
# on the host itself (deploiement-aws.md §5.2, §12.1), not an AWS SG.
resource "aws_security_group" "app" {
  name        = "oei-prod-sg"
  description = "SG serveur unique OEI prod"
  vpc_id      = local.vpc_id

  tags = {
    Name = "oei-prod-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "https" {
  security_group_id = aws_security_group.app.id
  description       = "HTTPS open to the world"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  security_group_id = aws_security_group.app.id
  description       = "HTTP open to the world (301 redirect to HTTPS + ACME HTTP-01 challenge, handled by Caddy)"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "ssh" {
  security_group_id = aws_security_group.app.id
  description       = "SSH restricted to the administrator CIDR"
  ip_protocol       = "tcp"
  from_port         = 22
  to_port           = 22
  cidr_ipv4         = var.ssh_allowed_cidr
}

resource "aws_vpc_security_group_egress_rule" "all_outbound" {
  security_group_id = aws_security_group.app.id
  description       = "Allow all outbound traffic"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}
