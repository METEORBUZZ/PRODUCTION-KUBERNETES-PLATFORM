variable "aws_region" {
  description = "Target AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project identifier"
  type        = string
  default     = "catdog-platform"
}

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "kubernetes_version" {
  description = "EKS control plane Kubernetes version"
  type        = string
  default     = "1.31"
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS worker nodes"
  type        = list(string)
  default     = ["t3.medium", "t3a.medium"]
}

variable "min_nodes" {
  type    = number
  default = 3
}

variable "max_nodes" {
  type    = number
  default = 10
}

variable "desired_nodes" {
  type    = number
  default = 3
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.medium"
}
