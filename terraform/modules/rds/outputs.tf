output "db_instance_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "db_instance_address" {
  value = aws_db_instance.postgres.address
}

output "db_credentials_secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}

output "db_credentials_secret_name" {
  value = aws_secretsmanager_secret.db_credentials.name
}
