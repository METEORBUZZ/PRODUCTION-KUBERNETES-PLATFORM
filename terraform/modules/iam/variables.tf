variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "cluster_oidc_issuer_url" {
  type        = string
  default     = ""
  description = "EKS Cluster OIDC Issuer URL"
}

variable "github_repo" {
  type        = string
  default     = "production-kubernetes-platform/platform"
  description = "GitHub repository for OIDC authentication"
}
