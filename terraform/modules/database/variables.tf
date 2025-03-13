variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where database will be created"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the database subnet group"
  type        = list(string)
}

variable "instance_type" {
  description = "Instance type for the RDS instance"
  type        = string
}

variable "engine_version" {
  description = "Version of PostgreSQL to use"
  type        = string
}

variable "allocated_storage" {
  description = "Allocated storage for the database in GB"
  type        = number
  default     = 20
}

variable "database_name" {
  description = "Name of the database to create"
  type        = string
}

variable "database_username" {
  description = "Username for the database"
  type        = string
  sensitive   = true
}

variable "database_password" {
  description = "Password for the database"
  type        = string
  sensitive   = true
}

variable "security_group_ids" {
  description = "List of security group IDs to associate with the database"
  type        = list(string)
}

variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
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