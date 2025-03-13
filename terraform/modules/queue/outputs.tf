output "vote_queue_url" {
  description = "URL of the vote queue"
  value       = aws_sqs_queue.vote.url
}

output "vote_queue_arn" {
  description = "ARN of the vote queue"
  value       = aws_sqs_queue.vote.arn
}

output "vote_dlq_url" {
  description = "URL of the vote dead letter queue"
  value       = aws_sqs_queue.vote_deadletter.url
}

output "vote_dlq_arn" {
  description = "ARN of the vote dead letter queue"
  value       = aws_sqs_queue.vote_deadletter.arn
}