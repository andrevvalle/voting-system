output "domain_name" {
  description = "Domain name for the frontend CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "api_domain_name" {
  description = "Domain name for the API CloudFront distribution"
  value       = aws_cloudfront_distribution.api.domain_name
}

output "frontend_distribution_id" {
  description = "ID of the frontend CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.id
}

output "api_distribution_id" {
  description = "ID of the API CloudFront distribution"
  value       = aws_cloudfront_distribution.api.id
}

output "frontend_distribution_arn" {
  description = "ARN of the frontend CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.arn
}

output "api_distribution_arn" {
  description = "ARN of the API CloudFront distribution"
  value       = aws_cloudfront_distribution.api.arn
}