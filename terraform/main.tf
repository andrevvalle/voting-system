provider "aws" {
  region = var.aws_region
}

# Dados do ambiente atual
locals {
  environment = terraform.workspace
  name_prefix = "${var.project_name}-${local.environment}"
  
  common_tags = {
    Project     = var.project_name
    Environment = local.environment
    ManagedBy   = "Terraform"
  }
}

# Módulo para rede (VPC, subnets, etc.)
module "network" {
  source = "./modules/network"
  
  name_prefix        = local.name_prefix
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  
  tags = local.common_tags
}

# Módulo para cache com ElastiCache Redis
module "cache" {
  source = "./modules/cache"
  
  name_prefix    = local.name_prefix
  vpc_id         = module.network.vpc_id
  subnet_ids     = module.network.private_subnet_ids
  instance_type  = var.redis_instance_type
  redis_version  = var.redis_version
  
  security_group_ids = [module.security.redis_sg_id]
  
  tags = local.common_tags
}

# Módulo para banco de dados (RDS PostgreSQL)
module "database" {
  source = "./modules/database"
  
  name_prefix    = local.name_prefix
  vpc_id         = module.network.vpc_id
  subnet_ids     = module.network.private_subnet_ids
  instance_type  = var.postgres_instance_type
  engine_version = var.postgres_version
  
  database_name     = var.database_name
  database_username = var.database_username
  database_password = var.database_password
  
  security_group_ids = [module.security.postgres_sg_id]
  
  backup_retention_period = var.environment == "production" ? 7 : 1
  
  tags = local.common_tags
}

# Módulo para filas (SQS)
module "queue" {
  source = "./modules/queue"
  
  name_prefix = local.name_prefix
  
  tags = local.common_tags
}

# Módulo para grupos de segurança
module "security" {
  source = "./modules/security"
  
  name_prefix  = local.name_prefix
  vpc_id       = module.network.vpc_id
  
  tags = local.common_tags
}

# Módulo para ECS (container orchestration)
module "ecs" {
  source = "./modules/ecs"
  
  name_prefix        = local.name_prefix
  vpc_id             = module.network.vpc_id
  public_subnet_ids  = module.network.public_subnet_ids
  private_subnet_ids = module.network.private_subnet_ids
  
  backend_image    = "${module.ecr.repository_url_backend}:${var.app_version}"
  frontend_image   = "${module.ecr.repository_url_frontend}:${var.app_version}"
  worker_image     = "${module.ecr.repository_url_worker}:${var.app_version}"
  
  desired_count_backend  = var.backend_instance_count
  desired_count_frontend = var.frontend_instance_count
  desired_count_worker   = var.worker_instance_count
  
  backend_cpu     = var.backend_cpu
  backend_memory  = var.backend_memory
  frontend_cpu    = var.frontend_cpu
  frontend_memory = var.frontend_memory
  worker_cpu      = var.worker_cpu
  worker_memory   = var.worker_memory
  
  security_group_ids = {
    backend  = [module.security.backend_sg_id]
    frontend = [module.security.frontend_sg_id]
    worker   = [module.security.worker_sg_id]
  }
  
  environment_variables = {
    backend = {
      NODE_ENV           = local.environment
      PORT               = "4000"
      DATABASE_HOST      = module.database.endpoint
      DATABASE_PORT      = "5432"
      DATABASE_NAME      = var.database_name
      DATABASE_USER      = var.database_username
      DATABASE_PASSWORD  = var.database_password
      REDIS_URL          = "redis://${module.cache.endpoint}:6379"
      AWS_REGION         = var.aws_region
      SQS_VOTE_QUEUE_URL = module.queue.vote_queue_url
      CORS_ORIGIN        = "https://${module.cdn.domain_name}"
      JWT_SECRET         = var.jwt_secret
    }
    
    frontend = {
      NODE_ENV           = local.environment
      BACKEND_URL        = "http://backend:4000"
      PUBLIC_BACKEND_URL = "https://api-${var.domain_name}"
      JWT_SECRET         = var.jwt_secret
    }
    
    worker = {
      NODE_ENV           = local.environment
      DATABASE_HOST      = module.database.endpoint
      DATABASE_PORT      = "5432"
      DATABASE_NAME      = var.database_name
      DATABASE_USER      = var.database_username
      DATABASE_PASSWORD  = var.database_password
      AWS_REGION         = var.aws_region
      SQS_VOTE_QUEUE_URL = module.queue.vote_queue_url
    }
  }
  
  tags = local.common_tags
}

# Módulo para ECR (container registry)
module "ecr" {
  source = "./modules/ecr"
  
  name_prefix = local.name_prefix
  
  tags = local.common_tags
}

# Módulo para CDN (CloudFront)
module "cdn" {
  source = "./modules/cdn"
  
  name_prefix   = local.name_prefix
  domain_name   = var.domain_name
  api_domain    = "api.${var.domain_name}"
  alb_domain    = module.ecs.alb_dns_name
  
  tags = local.common_tags
}

# Módulo para monitoramento (CloudWatch)
module "monitoring" {
  source = "./modules/monitoring"
  
  name_prefix       = local.name_prefix
  sqs_queue_arn     = module.queue.vote_queue_arn
  sqs_queue_name    = split(":", module.queue.vote_queue_arn)[5]
  redis_cluster_id  = module.cache.id
  ecs_cluster_name  = module.ecs.cluster_name
  
  alarm_email = var.alarm_email
  
  tags = local.common_tags
}

# Outputs
output "backend_url" {
  description = "Backend API URL"
  value       = "https://api.${var.domain_name}"
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = "https://${var.domain_name}"
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value = {
    backend  = module.ecr.repository_url_backend
    frontend = module.ecr.repository_url_frontend
    worker   = module.ecr.repository_url_worker
  }
}

output "database_endpoint" {
  description = "PostgreSQL RDS endpoint"
  value       = module.database.endpoint
}

output "redis_endpoint" {
  description = "Redis ElastiCache endpoint"
  value       = module.cache.endpoint
}

output "sqs_queue_url" {
  description = "SQS queue URL"
  value       = module.queue.vote_queue_url
}