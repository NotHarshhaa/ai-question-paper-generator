output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Elastic IP — stable public IP address"
  value       = aws_eip.app.public_ip
}

output "api_url" {
  description = "Backend API base URL (use this in frontend .env.local)"
  value       = "http://${aws_eip.app.public_ip}/api"
}

output "api_health_url" {
  description = "Health check endpoint — open in browser to verify deployment"
  value       = "http://${aws_eip.app.public_ip}/api/health"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app.public_ip}"
}

output "logs_command" {
  description = "Command to stream live application logs"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app.public_ip} 'sudo journalctl -u ai-question-paper -f'"
}

output "bootstrap_log_command" {
  description = "Command to check the cloud-init bootstrap log (useful on first deploy)"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app.public_ip} 'sudo cat /var/log/user-data.log'"
}

output "ami_id" {
  description = "Ubuntu 22.04 LTS AMI used"
  value       = data.aws_ami.ubuntu.id
}

output "frontend_env" {
  description = "Paste this into frontend/.env.local"
  value       = "NEXT_PUBLIC_API_URL=http://${aws_eip.app.public_ip}/api"
}
