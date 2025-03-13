/**
 * Cache Module
 * Creates ElastiCache Redis cluster for the application
 */

resource "aws_elasticache_subnet_group" "main" {
  name        = "${var.name_prefix}-redis-subnet-group"
  description = "Redis subnet group for ${var.name_prefix}"
  subnet_ids  = var.subnet_ids
}

resource "aws_elasticache_parameter_group" "main" {
  name        = "${var.name_prefix}-redis-param-group"
  family      = "redis${var.redis_version}"
  description = "Redis parameter group for ${var.name_prefix}"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id          = "${var.name_prefix}-redis"
  description                   = "Redis cluster for ${var.name_prefix}"
  node_type                     = var.instance_type
  port                          = 6379
  parameter_group_name          = aws_elasticache_parameter_group.main.name
  subnet_group_name             = aws_elasticache_subnet_group.main.name
  security_group_ids            = var.security_group_ids
  automatic_failover_enabled    = var.environment == "production"
  multi_az_enabled              = var.environment == "production"
  num_cache_clusters            = var.environment == "production" ? 2 : 1
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = true
  apply_immediately             = true
  auto_minor_version_upgrade    = true
  maintenance_window            = "sun:05:00-sun:06:00"
  snapshot_window               = "03:00-04:00"
  snapshot_retention_limit      = var.environment == "production" ? 7 : 1
  final_snapshot_identifier     = var.environment == "production" ? "${var.name_prefix}-redis-final-snapshot" : null

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-redis"
    }
  )
}