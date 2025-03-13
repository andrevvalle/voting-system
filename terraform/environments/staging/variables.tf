variable "aws_region" {
  description = "AWS region to deploy the infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "voting-system"
}

# Network settings
variable "vpc_cidr" {
  description = "CIDR for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnets" {
  description = "CIDRs for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "private_subnets" {
  description = "CIDRs for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

# Redis settings
variable "redis_instance_type" {
  description = "Instance type for ElastiCache Redis"
  type        = string
  default     = "cache.t4g.medium"
}

variable "redis_version" {
  description = "Version of Redis for ElastiCache"
  type        = string
  default     = "7.0"
}

# PostgreSQL settings
variable "postgres_instance_type" {
  description = "Instance type for RDS PostgreSQL"
  type        = string
  default     = "db.t4g.medium"
}

variable "postgres_version" {
  description = "Version of PostgreSQL for RDS"
  type        = string
  default     = "14"
}

variable "database_name" {
  description = "Name of the database"
  type        = string
  default     = "voting"
}

variable "database_username" {
  description = "Username for PostgreSQL database"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "database_password" {
  description = "Password for PostgreSQL database"
  type        = string
  sensitive   = true
}

# Application settings
variable "app_version" {
  description = "Version of the application to deploy"
  type        = string
  default     = "latest"
}

variable "backend_instance_count" {
  description = "Number of backend instances"
  type        = number
  default     = 2
}

variable "frontend_instance_count" {
  description = "Number of frontend instances"
  type        = number
  default     = 2
}

variable "worker_instance_count" {
  description = "Number of worker instances"
  type        = number
  default     = 2
}

variable "backend_cpu" {
  description = "CPU for backend service (in units - 1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory for backend service (in MiB)"
  type        = number
  default     = 1024
}

variable "frontend_cpu" {
  description = "CPU for frontend service (in units - 1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "frontend_memory" {
  description = "Memory for frontend service (in MiB)"
  type        = number
  default     = 1024
}

variable "worker_cpu" {
  description = "CPU for worker service (in units - 1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "worker_memory" {
  description = "Memory for worker service (in MiB)"
  type        = number
  default     = 1024
}

# Security settings
variable "jwt_secret" {
  description = "Secret key for JWT token signing"
  type        = string
  sensitive   = true
}

# Domain settings
variable "domain_name" {
  description = "Main domain name for the application"
  type        = string
  default     = "staging.voting-system.example.com"
}

# Monitoring settings
variable "alarm_email" {
  description = "Email to receive CloudWatch alarms"
  type        = string
  default     = "staging-admin@example.com"
}