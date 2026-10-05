# AWS EKS Managed Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-managed-nodes"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = aws_subnet.private[*].id

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

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_ecr_read_only,
  ]
}
