/**
 * Monitoring Module
 * Creates CloudWatch alarms and dashboard for the application
 */

# SNS topic for alarms
resource "aws_sns_topic" "alarms" {
  name = "${var.name_prefix}-alarms"
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-alarms"
    }
  )
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# SQS alarms
resource "aws_cloudwatch_metric_alarm" "sqs_queue_depth" {
  alarm_name          = "${var.name_prefix}-sqs-queue-depth"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Average"
  threshold           = 5000
  alarm_description   = "This alarm monitors SQS queue depth"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  
  dimensions = {
    QueueName = var.sqs_queue_name
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-sqs-queue-depth-alarm"
    }
  )
}

resource "aws_cloudwatch_metric_alarm" "sqs_age" {
  alarm_name          = "${var.name_prefix}-sqs-message-age"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ApproximateAgeOfOldestMessage"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Maximum"
  threshold           = 3600 # 1 hour
  alarm_description   = "This alarm monitors SQS message age"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  
  dimensions = {
    QueueName = var.sqs_queue_name
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-sqs-message-age-alarm"
    }
  )
}

# Redis alarms
resource "aws_cloudwatch_metric_alarm" "redis_cpu" {
  alarm_name          = "${var.name_prefix}-redis-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This alarm monitors Redis CPU utilization"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  
  dimensions = {
    CacheClusterId = var.redis_cluster_id
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-redis-cpu-alarm"
    }
  )
}

resource "aws_cloudwatch_metric_alarm" "redis_memory" {
  alarm_name          = "${var.name_prefix}-redis-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This alarm monitors Redis memory usage"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  
  dimensions = {
    CacheClusterId = var.redis_cluster_id
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-redis-memory-alarm"
    }
  )
}

# ECS alarms
resource "aws_cloudwatch_metric_alarm" "ecs_cpu" {
  alarm_name          = "${var.name_prefix}-ecs-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This alarm monitors ECS CPU utilization"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  
  dimensions = {
    ClusterName = var.ecs_cluster_name
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-ecs-cpu-alarm"
    }
  )
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory" {
  alarm_name          = "${var.name_prefix}-ecs-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This alarm monitors ECS memory utilization"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  
  dimensions = {
    ClusterName = var.ecs_cluster_name
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-ecs-memory-alarm"
    }
  )
}

# Dashboard for the application
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.name_prefix}-dashboard"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", var.sqs_queue_name]
          ]
          view       = "timeSeries"
          stacked    = false
          region     = var.aws_region
          title      = "SQS Queue Depth"
          period     = 300
          stat       = "Average"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", "CacheClusterId", var.redis_cluster_id]
          ]
          view       = "timeSeries"
          stacked    = false
          region     = var.aws_region
          title      = "Redis CPU Utilization"
          period     = 300
          stat       = "Average"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ElastiCache", "DatabaseMemoryUsagePercentage", "CacheClusterId", var.redis_cluster_id]
          ]
          view       = "timeSeries"
          stacked    = false
          region     = var.aws_region
          title      = "Redis Memory Usage"
          period     = 300
          stat       = "Average"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", var.ecs_cluster_name]
          ]
          view       = "timeSeries"
          stacked    = false
          region     = var.aws_region
          title      = "ECS CPU Utilization"
          period     = 300
          stat       = "Average"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ECS", "MemoryUtilization", "ClusterName", var.ecs_cluster_name]
          ]
          view       = "timeSeries"
          stacked    = false
          region     = var.aws_region
          title      = "ECS Memory Utilization"
          period     = 300
          stat       = "Average"
        }
      }
    ]
  })
}