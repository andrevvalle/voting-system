output "repository_url_backend" {
  description = "URL of the backend ECR repository"
  value       = aws_ecr_repository.backend.repository_url
}

output "repository_url_frontend" {
  description = "URL of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.repository_url
}

output "repository_url_worker" {
  description = "URL of the worker ECR repository"
  value       = aws_ecr_repository.worker.repository_url
}

output "repository_arn_backend" {
  description = "ARN of the backend ECR repository"
  value       = aws_ecr_repository.backend.arn
}

output "repository_arn_frontend" {
  description = "ARN of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.arn
}

output "repository_arn_worker" {
  description = "ARN of the worker ECR repository"
  value       = aws_ecr_repository.worker.arn
}