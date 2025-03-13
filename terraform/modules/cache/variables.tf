variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where Redis will be created"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the Redis subnet group"
  type        = list(string)
}

variable "instance_type" {
  description = "Instance type for the Redis instance"
  type        = string
}

variable "redis_version" {
  description = "Version of Redis to use"
  type        = string
}

variable "security_group_ids" {
  description = "List of security group IDs to associate with the Redis instance"
  type        = list(string)
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