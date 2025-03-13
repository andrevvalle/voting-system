output "backend_url" {
  description = "Backend API URL"
  value       = module.voting_system.backend_url
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = module.voting_system.frontend_url
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value       = module.voting_system.ecr_repositories
}

output "database_endpoint" {
  description = "PostgreSQL RDS endpoint"
  value       = module.voting_system.database_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis ElastiCache endpoint"
  value       = module.voting_system.redis_endpoint
  sensitive   = true
}

output "sqs_queue_url" {
  description = "SQS queue URL"
  value       = module.voting_system.sqs_queue_url
}