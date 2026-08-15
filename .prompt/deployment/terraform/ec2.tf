resource "aws_key_pair" "deploy" {
  key_name   = var.ssh_key_pair_name
  public_key = var.ssh_public_key

  tags = {
    Name = var.ssh_key_pair_name
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ssm_parameter.al2023_arm64_ami.value
  instance_type          = var.instance_type
  key_name               = aws_key_pair.deploy.key_name
  subnet_id              = local.subnet_id
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  # NOTE on the Reserved Instance billing discount (deploiement-aws.md §4.3):
  # a Reserved Instance is a BILLING commitment, not a provisioning mechanism.
  # It cannot be expressed as a Terraform resource that "launches" anything —
  # purchase it once, out of band, with:
  #   aws ec2 purchase-reserved-instances-offering --reserved-instances-offering-id <ID> \
  #     --instance-count 1 --region <aws_region>
  # matching this instance's type/region/AZ so the discount applies automatically.

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_size_gb
    encrypted             = true
    delete_on_termination = var.root_volume_delete_on_termination
  }

  user_data                   = templatefile("${path.module}/templates/user_data.sh.tftpl", {})
  user_data_replace_on_change = false

  tags = {
    Name = "oei-prod"
  }
}

resource "aws_eip" "app" {
  domain   = "vpc"
  instance = aws_instance.app.id

  tags = {
    Name = "oei-prod-eip"
  }
}
