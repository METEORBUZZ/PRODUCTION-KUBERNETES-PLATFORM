output "cluster_role_arn" {
  value = aws_iam_role.eks_cluster.arn
}

output "node_role_arn" {
  value = aws_iam_role.eks_nodes.arn
}

output "alb_controller_policy_arn" {
  value = aws_iam_policy.alb_controller.arn
}

output "external_secrets_policy_arn" {
  value = aws_iam_policy.external_secrets.arn
}
