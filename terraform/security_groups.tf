# EKS Cluster Security Group
resource "aws_security_group" "eks_cluster" {
  name        = "${var.project_name}-cluster-sg"
  description = "Security group for EKS control plane"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-cluster-sg"
    Environment = var.environment
  }
}

# EKS Worker Nodes Security Group
resource "aws_security_group" "eks_nodes" {
  name        = "${var.project_name}-nodes-sg"
  description = "Security group for EKS worker nodes"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow nodes to communicate with control plane"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster.id]
  }

  ingress {
    description = "Allow node-to-node communication"
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
    Name                                              = "${var.project_name}-nodes-sg"
    Environment                                       = var.environment
    "kubernetes.io/cluster/${var.project_name}-cluster" = "owned"
  }
}

# RDS PostgreSQL Database Security Group
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for PostgreSQL database allowing only EKS nodes"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL inbound from EKS worker nodes"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-rds-sg"
    Environment = var.environment
  }
}
