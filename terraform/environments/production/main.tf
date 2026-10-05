locals {
  cluster_name = "${var.project_name}-cluster"
}

# 1. VPC Module (Multi-AZ with public, private app, private db subnets)
module "vpc" {
  source = "../../modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  cluster_name = locals.cluster_name
}

# 2. IAM Module (EKS roles, IRSA policies for ALB & External Secrets)
module "iam" {
  source = "../../modules/iam"

  project_name            = var.project_name
  environment             = var.environment
  cluster_name            = locals.cluster_name
  cluster_oidc_issuer_url = module.eks.oidc_provider_url
}

# 3. EKS Module (Control plane, KMS secret encryption, Managed Node Group)
module "eks" {
  source = "../../modules/eks"

  project_name           = var.project_name
  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  public_subnet_ids      = module.vpc.public_subnet_ids
  private_app_subnet_ids = module.vpc.private_app_subnet_ids
  cluster_role_arn       = module.iam.cluster_role_arn
  node_role_arn          = module.iam.node_role_arn
  kubernetes_version     = var.kubernetes_version
  min_nodes              = var.min_nodes
  max_nodes              = var.max_nodes
  desired_nodes          = var.desired_nodes
  node_instance_types    = var.node_instance_types
}

# 4. ECR Module (Repositories with scan-on-push and immutability)
module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

# 5. RDS PostgreSQL Module (Multi-AZ, private subnets, Secrets Manager)
module "rds" {
  source = "../../modules/rds"

  project_name               = var.project_name
  environment                = var.environment
  vpc_id                     = module.vpc.vpc_id
  private_db_subnet_ids      = module.vpc.private_db_subnet_ids
  eks_node_security_group_id = module.eks.node_security_group_id
  instance_class             = var.db_instance_class
}
