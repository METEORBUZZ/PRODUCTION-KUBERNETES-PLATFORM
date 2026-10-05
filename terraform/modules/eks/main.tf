# 1. KMS Key for Kubernetes Secret Encryption at Rest
resource "aws_kms_key" "eks_secrets" {
  description             = "KMS Key for EKS envelope encryption of Kubernetes secrets"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "${var.project_name}-eks-secrets-key"
    Environment = var.environment
  }
}

# 2. EKS Cluster Security Group
resource "aws_security_group" "cluster" {
  name        = "${var.project_name}-eks-cluster-sg"
  description = "Security group for EKS control plane"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-eks-cluster-sg"
    Environment = var.environment
  }
}

# 3. EKS Worker Nodes Security Group
resource "aws_security_group" "nodes" {
  name        = "${var.project_name}-eks-nodes-sg"
  description = "Security group for EKS worker nodes"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Control plane communication"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.cluster.id]
  }

  ingress {
    description = "Node-to-node internal communication"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name                                              = "${var.project_name}-eks-nodes-sg"
    Environment                                       = var.environment
    "kubernetes.io/cluster/${var.project_name}-cluster" = "owned"
    "karpenter.sh/discovery"                          = "${var.project_name}-cluster"
  }
}

# 4. EKS Control Plane
resource "aws_eks_cluster" "main" {
  name     = "${var.project_name}-cluster"
  role_arn = var.cluster_role_arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = concat(var.public_subnet_ids, var.private_app_subnet_ids)
    endpoint_private_access = true
    endpoint_public_access  = true
    security_group_ids      = [aws_security_group.cluster.id]
  }

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks_secrets.arn
    }
    resources = ["secrets"]
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  tags = {
    Name        = "${var.project_name}-cluster"
    Environment = var.environment
  }
}

# 5. OIDC Identity Provider for IRSA
data "tls_certificate" "eks" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

# 6. EKS Managed Node Group in Private Subnets
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-managed-nodes"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.private_app_subnet_ids

  scaling_config {
    desired_size = var.desired_nodes
    max_size     = var.max_nodes
    min_size     = var.min_nodes
  }

  update_config {
    max_unavailable = 1
  }

  instance_types = var.node_instance_types
  capacity_type  = "ON_DEMAND"
  disk_size      = 50

  labels = {
    role        = "worker"
    environment = var.environment
  }

  tags = {
    Name        = "${var.project_name}-worker-node"
    Environment = var.environment
  }
}
