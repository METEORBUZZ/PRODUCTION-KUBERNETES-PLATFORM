variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_app_subnet_ids" {
  type = list(string)
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "cluster_role_arn" {
  type = string
}

variable "node_role_arn" {
  type = string
}

variable "kubernetes_version" {
  type    = string
  default = "1.31"
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

variable "node_instance_types" {
  type    = list(string)
  default = ["t3.medium"]
}
