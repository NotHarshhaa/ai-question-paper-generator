# =============================================================================
# main.tf — EC2 instance, security group, key pair, Elastic IP
# =============================================================================

# ── Latest Ubuntu 22.04 LTS AMI (Canonical) ──────────────────────────────────
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

# ── SSH Key Pair ──────────────────────────────────────────────────────────────
resource "aws_key_pair" "app" {
  key_name   = "${var.app_name}-key"
  public_key = file(var.public_key_path)
}

# ── Security Group ────────────────────────────────────────────────────────────
resource "aws_security_group" "app" {
  name        = "${var.app_name}-sg"
  description = "AI Question Paper Generator — allow HTTP and SSH"

  # SSH
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  # HTTP (Nginx)
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS — ready for when you add a TLS cert
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound (pip install, model download, git clone, etc.)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-sg"
  }
}

# ── EC2 Instance ──────────────────────────────────────────────────────────────
resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.app.key_name
  vpc_security_group_ids = [aws_security_group.app.id]

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.volume_size_gb
    delete_on_termination = true
    encrypted             = true
  }

  # Bootstrap script — installs everything on first boot
  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    app_name         = var.app_name
    github_repo      = var.github_repo
    t5_model_name    = var.t5_model_name
    bert_model_name  = var.bert_model_name
    disable_t5_model = tostring(var.disable_t5_model)
  })

  # Make sure user_data re-runs if the script changes
  user_data_replace_on_change = true

  tags = {
    Name = var.app_name
  }

  # Bootstrap can take up to 10 minutes (pip install + model download)
  timeouts {
    create = "15m"
  }
}

# ── Elastic IP — stable public IP that survives stop/start ───────────────────
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Name = "${var.app_name}-eip"
  }

  # EIP must be created after the instance
  depends_on = [aws_instance.app]
}
