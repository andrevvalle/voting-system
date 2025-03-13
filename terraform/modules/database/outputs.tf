output "endpoint" {
  description = "Database endpoint address"
  value       = aws_db_instance.main.address
}

output "port" {
  description = "Database port"
  value       = aws_db_instance.main.port
}

output "name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "id" {
  description = "Database instance ID"
  value       = aws_db_instance.main.id
}

output "arn" {
  description = "Database instance ARN"
  value       = aws_db_instance.main.arn
}