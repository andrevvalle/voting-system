variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "backend_image" {
  description = "Backend container image"
  type        = string
}

variable "frontend_image" {
  description = "Frontend container image"
  type        = string
}

variable "worker_image" {
  description = "Worker container image"
  type        = string
}

variable "desired_count_backend" {
  description = "Desired count of backend tasks"
  type        = number
  default     = 2
}

variable "desired_count_frontend" {
  description = "Desired count of frontend tasks"
  type        = number
  default     = 2
}

variable "desired_count_worker" {
  description = "Desired count of worker tasks"
  type        = number
  default     = 2
}

variable "backend_cpu" {
  description = "CPU units for backend task"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory for backend task in MiB"
  type        = number
  default     = 1024
}

variable "frontend_cpu" {
  description = "CPU units for frontend task"
  type        = number
  default     = 512
}

variable "frontend_memory" {
  description = "Memory for frontend task in MiB"
  type        = number
  default     = 1024
}

variable "worker_cpu" {
  description = "CPU units for worker task"
  type        = number
  default     = 512
}

variable "worker_memory" {
  description = "Memory for worker task in MiB"
  type        = number
  default     = 1024
}

variable "environment_variables" {
  description = "Environment variables for containers"
  type        = map(map(string))
}

variable "security_group_ids" {
  description = "Security group IDs for services"
  type        = map(string)
}

variable "environment" {
  description = "Environment (development, staging, production)"
  type        = string
  default     = "development"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}