output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "eks_cluster_name" {
  description = "EKS Cluster Name"
  value       = aws_eks_cluster.main.name
}

output "eks_cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = aws_eks_cluster.main.endpoint
}

output "ecr_backend_url" {
  description = "ECR repository URL for backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR repository URL for frontend"
  value       = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  description = "PostgreSQL RDS connection endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "kubectl_configure_command" {
  description = "Command to configure kubectl with the new cluster"
  value       = "aws eks --region ${var.aws_region} update-kubeconfig --name ${aws_eks_cluster.main.name}"
}
