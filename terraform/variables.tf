# ─── General ─────────────────────────────────────────────────────────────────

variable "aws_region" {
  description = "AWS region to deploy in (default: ap-south-1 = Mumbai)"
  type        = string
  default     = "ap-south-1"
}

variable "app_name" {
  description = "Application name — used for resource names and tags"
  type        = string
  default     = "ai-question-paper-generator"
}

# ─── Compute ──────────────────────────────────────────────────────────────────

variable "instance_type" {
  description = "EC2 instance type. t2.micro is free-tier eligible."
  type        = string
  default     = "t2.micro"

  validation {
    condition     = can(regex("^t[23]\\.(micro|small|medium)", var.instance_type))
    error_message = "Use a t2/t3 family instance for cost-efficiency."
  }
}

variable "volume_size_gb" {
  description = "Root EBS volume size in GB (free tier gives 30 GB)"
  type        = number
  default     = 20
}

# ─── SSH / Key Pair ───────────────────────────────────────────────────────────

variable "public_key_path" {
  description = "Path to your SSH public key file. Terraform will create an EC2 key pair from it."
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH into the instance. Restrict to your IP for security."
  type        = string
  default     = "0.0.0.0/0" # Change to 'YOUR_IP/32' for production
}

# ─── Application ──────────────────────────────────────────────────────────────

variable "github_repo" {
  description = "GitHub repository URL to clone on the EC2 instance"
  type        = string
  default     = "https://github.com/NotHarshhaa/ai-question-paper-generator"
}

variable "t5_model_name" {
  description = "HuggingFace T5 model name for question generation"
  type        = string
  default     = "valhalla/t5-small-qg-hl"
}

variable "bert_model_name" {
  description = "HuggingFace SentenceTransformer model name for similarity"
  type        = string
  default     = "sentence-transformers/all-MiniLM-L6-v2"
}

variable "disable_t5_model" {
  description = "Skip loading the T5 model. Recommended for t2.micro (1 GB RAM). Set false on t3.small+ (2 GB+)."
  type        = bool
  default     = true
}
