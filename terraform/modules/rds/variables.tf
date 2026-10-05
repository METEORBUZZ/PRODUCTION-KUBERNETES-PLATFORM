variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_db_subnet_ids" {
  type = list(string)
}

variable "eks_node_security_group_id" {
  type = string
}

variable "db_name" {
  type    = string
  default = "catdog"
}

variable "db_username" {
  type    = string
  default = "catdogadmin"
}

variable "instance_class" {
  type    = string
  default = "db.t4g.medium"
}
