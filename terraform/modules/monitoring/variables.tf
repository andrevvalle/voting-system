variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "sqs_queue_arn" {
  description = "ARN of the SQS queue to monitor"
  type        = string
}

variable "sqs_queue_name" {
  description = "Name of the SQS queue to monitor"
  type        = string
}

variable "redis_cluster_id" {
  description = "ID of the Redis cluster to monitor"
  type        = string
}

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster to monitor"
  type        = string
}

variable "alarm_email" {
  description = "Email address to send alarm notifications"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}