variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (production/staging)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project identifier"
  type        = string
  default     = "catdog-platform"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "kubernetes_version" {
  description = "EKS Kubernetes control plane version"
  type        = string
  default     = "1.31"
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS worker nodes"
  type        = list(string)
  default     = ["t3.medium", "t3a.medium"]
}

variable "min_nodes" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 3
}

variable "max_nodes" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 10
}

variable "desired_nodes" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 3
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.medium"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "catdog"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "catdogadmin"
}
