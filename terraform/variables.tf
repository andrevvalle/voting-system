variable "aws_region" {
  description = "Região da AWS para implantar a infraestrutura"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "voting-system"
}

variable "environment" {
  description = "Ambiente de implantação (development, staging, production)"
  type        = string
  default     = "development"
}

# Variáveis de rede
variable "vpc_cidr" {
  description = "CIDR da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Zonas de disponibilidade para usar"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnets" {
  description = "CIDRs das sub-redes públicas"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "private_subnets" {
  description = "CIDRs das sub-redes privadas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

# Variáveis do Redis
variable "redis_instance_type" {
  description = "Tipo de instância para o ElastiCache Redis"
  type        = string
  default     = "cache.t4g.small"
}

variable "redis_version" {
  description = "Versão do Redis para ElastiCache"
  type        = string
  default     = "7.0"
}

# Variáveis do PostgreSQL
variable "postgres_instance_type" {
  description = "Tipo de instância para o RDS PostgreSQL"
  type        = string
  default     = "db.t4g.small"
}

variable "postgres_version" {
  description = "Versão do PostgreSQL para RDS"
  type        = string
  default     = "14"
}

variable "database_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = "voting"
}

variable "database_username" {
  description = "Nome de usuário para o banco de dados PostgreSQL"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "database_password" {
  description = "Senha para o banco de dados PostgreSQL"
  type        = string
  sensitive   = true
}

# Variáveis de aplicação
variable "app_version" {
  description = "Versão da aplicação para deploy"
  type        = string
  default     = "latest"
}

variable "backend_instance_count" {
  description = "Número de instâncias do backend"
  type        = number
  default     = 2
}

variable "frontend_instance_count" {
  description = "Número de instâncias do frontend"
  type        = number
  default     = 2
}

variable "worker_instance_count" {
  description = "Número de instâncias do worker"
  type        = number
  default     = 2
}

variable "backend_cpu" {
  description = "CPU para o serviço backend (em unidades - 1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memória para o serviço backend (em MiB)"
  type        = number
  default     = 1024
}

variable "frontend_cpu" {
  description = "CPU para o serviço frontend (em unidades - 1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "frontend_memory" {
  description = "Memória para o serviço frontend (em MiB)"
  type        = number
  default     = 1024
}

variable "worker_cpu" {
  description = "CPU para o serviço worker (em unidades - 1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "worker_memory" {
  description = "Memória para o serviço worker (em MiB)"
  type        = number
  default     = 1024
}

# Variáveis de segurança
variable "jwt_secret" {
  description = "Chave secreta para assinatura de tokens JWT"
  type        = string
  sensitive   = true
}

# Variáveis de domínio
variable "domain_name" {
  description = "Nome de domínio principal para a aplicação"
  type        = string
  default     = "example.com"
}

# Variáveis de monitoramento
variable "alarm_email" {
  description = "Email para receber alertas do CloudWatch"
  type        = string
  default     = "admin@example.com"
}