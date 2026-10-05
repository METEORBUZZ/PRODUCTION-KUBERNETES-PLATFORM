# Subnet Group for RDS across Private Subnets
resource "aws_db_subnet_group" "rds" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "${var.project_name}-db-subnet-group"
    Environment = var.environment
  }
}

# DB Parameter Group
resource "aws_db_parameter_group" "postgres" {
  name   = "${var.project_name}-pg16-params"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }
}

# Production Multi-AZ RDS PostgreSQL Instance
resource "aws_db_instance" "postgres" {
  identifier        = "${var.project_name}-postgres"
  engine            = "postgres"
  engine_version    = "16.3"
  instance_class    = var.db_instance_class
  allocated_storage = 20
  max_allocated_storage = 100
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_username
  password = "ProductionSecurePassword123!" # In real AWS, sourced from AWS Secrets Manager

  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.postgres.name

  multi_az               = true
  publicly_accessible    = false
  skip_final_snapshot    = true
  deletion_protection    = false
  backup_retention_period = 7

  tags = {
    Name        = "${var.project_name}-postgres"
    Environment = var.environment
  }
}
