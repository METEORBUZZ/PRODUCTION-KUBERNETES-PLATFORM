output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS Cluster Name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS API Server Endpoint"
  value       = module.eks.cluster_endpoint
}

output "ecr_backend_url" {
  description = "ECR Backend Image Repository"
  value       = module.ecr.backend_repository_url
}

output "ecr_frontend_url" {
  description = "ECR Frontend Image Repository"
  value       = module.ecr.frontend_repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL Connection Endpoint"
  value       = module.rds.db_instance_endpoint
}

output "db_credentials_secret_name" {
  description = "AWS Secrets Manager Secret Name for Database Credentials"
  value       = module.rds.db_credentials_secret_name
}

output "kubeconfig_command" {
  description = "Run this command to update local kubeconfig"
  value       = "aws eks --region ${var.aws_region} update-kubeconfig --name ${module.eks.cluster_name}"
}
