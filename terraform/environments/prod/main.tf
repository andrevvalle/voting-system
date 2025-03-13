provider "aws" {
  region = var.aws_region
}

terraform {
  backend "s3" {
    # This will be configured via the CLI or in terraform init command
    # bucket         = "voting-system-terraform-state"
    # key            = "prod/terraform.tfstate"
    # region         = "us-east-1"
    # dynamodb_table = "voting-system-terraform-locks"
    # encrypt        = true
  }
}

module "voting_system" {
  source = "../../"
  
  # General
  aws_region   = var.aws_region
  project_name = var.project_name
  environment  = "production"
  
  # Network settings
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  
  # Redis settings
  redis_instance_type = var.redis_instance_type
  redis_version       = var.redis_version
  
  # PostgreSQL settings
  postgres_instance_type = var.postgres_instance_type
  postgres_version       = var.postgres_version
  database_name          = var.database_name
  database_username      = var.database_username
  database_password      = var.database_password
  
  # Application settings
  app_version            = var.app_version
  backend_instance_count = var.backend_instance_count
  frontend_instance_count = var.frontend_instance_count
  worker_instance_count   = var.worker_instance_count
  backend_cpu            = var.backend_cpu
  backend_memory         = var.backend_memory
  frontend_cpu           = var.frontend_cpu
  frontend_memory        = var.frontend_memory
  worker_cpu             = var.worker_cpu
  worker_memory          = var.worker_memory
  
  # Security settings
  jwt_secret = var.jwt_secret
  
  # Domain settings
  domain_name = var.domain_name
  
  # Monitoring settings
  alarm_email = var.alarm_email
}