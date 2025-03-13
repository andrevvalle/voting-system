/**
 * Database Module
 * Creates RDS PostgreSQL instance for the application
 */

resource "aws_db_subnet_group" "main" {
  name        = "${var.name_prefix}-db-subnet-group"
  description = "Database subnet group for ${var.name_prefix}"
  subnet_ids  = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-db-subnet-group"
    }
  )
}

resource "aws_db_parameter_group" "main" {
  name        = "${var.name_prefix}-db-param-group"
  family      = "postgres${split(".", var.engine_version)[0]}"
  description = "Database parameter group for ${var.name_prefix}"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-db-param-group"
    }
  )
}

resource "aws_db_instance" "main" {
  identifier                  = "${var.name_prefix}-postgres"
  allocated_storage           = var.allocated_storage
  storage_type                = "gp2"
  engine                      = "postgres"
  engine_version              = var.engine_version
  instance_class              = var.instance_type
  db_name                     = var.database_name
  username                    = var.database_username
  password                    = var.database_password
  parameter_group_name        = aws_db_parameter_group.main.name
  db_subnet_group_name        = aws_db_subnet_group.main.name
  vpc_security_group_ids      = var.security_group_ids
  publicly_accessible         = false
  skip_final_snapshot         = var.environment != "production"
  final_snapshot_identifier   = var.environment == "production" ? "${var.name_prefix}-postgres-final-snapshot" : null
  backup_retention_period     = var.backup_retention_period
  backup_window               = "03:00-04:00"
  maintenance_window          = "Mon:04:00-Mon:05:00"
  auto_minor_version_upgrade  = true
  deletion_protection         = var.environment == "production"
  storage_encrypted           = var.environment == "production"
  multi_az                    = var.environment == "production"
  performance_insights_enabled = var.environment == "production"

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-postgres"
    }
  )
}