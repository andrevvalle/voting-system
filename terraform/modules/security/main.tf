/**
 * Security Module
 * Creates security groups and WAF rules for various components of the application
 */

# Security group for frontend service (ALB)
resource "aws_security_group" "frontend" {
  name        = "${var.name_prefix}-frontend-sg"
  description = "Security group for frontend service"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP from anywhere (redirect to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-frontend-sg"
    }
  )
}

# Security group for backend service
resource "aws_security_group" "backend" {
  name        = "${var.name_prefix}-backend-sg"
  description = "Security group for backend service"
  vpc_id      = var.vpc_id

  ingress {
    description     = "API access from frontend"
    from_port       = 4000
    to_port         = 4000
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-backend-sg"
    }
  )
}

# Security group for worker service
resource "aws_security_group" "worker" {
  name        = "${var.name_prefix}-worker-sg"
  description = "Security group for worker service"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-worker-sg"
    }
  )
}

# Security group for Redis ElastiCache
resource "aws_security_group" "redis" {
  name        = "${var.name_prefix}-redis-sg"
  description = "Security group for Redis ElastiCache"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Redis from backend"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  ingress {
    description     = "Redis from worker"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.worker.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-redis-sg"
    }
  )
}

# Security group for PostgreSQL RDS
resource "aws_security_group" "postgres" {
  name        = "${var.name_prefix}-postgres-sg"
  description = "Security group for PostgreSQL RDS"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL from backend"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  ingress {
    description     = "PostgreSQL from worker"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.worker.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-postgres-sg"
    }
  )
}

# AWS WAF Web ACL para proteção contra ataques
resource "aws_wafv2_web_acl" "voting_system_waf" {
  name        = "${var.name_prefix}-voting-waf"
  description = "WAF para proteção do sistema de votação"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # Regra para limitar taxa de requisições por IP
  rule {
    name     = "RateLimitRule"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 300 # 300 requisições por 5 minutos
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }
  }

  # Regra para limitar requisições específicas de votação
  rule {
    name     = "VoteEndpointRateLimit"
    priority = 2

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 120 # 120 requisições por 5 minutos para endpoint de votação
        aggregate_key_type = "IP"
        
        scope_down_statement {
          byte_match_statement {
            search_string         = "/vote"
            positional_constraint = "CONTAINS"
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "VoteEndpointRateLimit"
      sampled_requests_enabled   = true
    }
  }

  # Regra para bloquear bots maliciosos
  rule {
    name     = "BlockBadBots"
    priority = 3

    action {
      block {}
    }

    statement {
      or_statement {
        statements {
          byte_match_statement {
            search_string         = "BadBot"
            positional_constraint = "CONTAINS"
            field_to_match {
              single_header {
                name = "user-agent"
              }
            }
            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }
        statements {
          byte_match_statement {
            search_string         = "scraper"
            positional_constraint = "CONTAINS"
            field_to_match {
              single_header {
                name = "user-agent"
              }
            }
            text_transformation {
              priority = 1
              type     = "LOWERCASE"
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "BlockBadBots"
      sampled_requests_enabled   = true
    }
  }

  # Proteção contra SQL Injection
  rule {
    name     = "SQLiRule"
    priority = 4

    action {
      block {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "SQLiRule"
      sampled_requests_enabled   = true
    }
  }

  # Proteção contra ataques comuns na web
  rule {
    name     = "CommonAttacksRule"
    priority = 5

    action {
      block {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
        
        # Excluir algumas regras que podem gerar falsos positivos
        excluded_rule {
          name = "SizeRestrictions_BODY"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonAttacksRule"
      sampled_requests_enabled   = true
    }
  }

  # Proteção específica para aplicações web
  rule {
    name     = "KnownBadInputsRule"
    priority = 6

    action {
      block {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "KnownBadInputsRule"
      sampled_requests_enabled   = true
    }
  }

  tags = var.tags

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "voting-system-waf"
    sampled_requests_enabled   = true
  }
}

# CloudWatch para logs do WAF
resource "aws_cloudwatch_log_group" "waf_log_group" {
  name              = "/aws/waf/${var.name_prefix}-voting-waf-logs"
  retention_in_days = 30
  tags              = var.tags
}

# Configuração de logging para o WAF
resource "aws_wafv2_web_acl_logging_configuration" "waf_logging" {
  count                   = var.enable_waf_logging ? 1 : 0
  log_destination_configs = [aws_cloudwatch_log_group.waf_log_group.arn]
  resource_arn            = aws_wafv2_web_acl.voting_system_waf.arn
  
  redacted_fields {
    single_header {
      name = "authorization"
    }
    
    single_header {
      name = "cookie"
    }
  }
}