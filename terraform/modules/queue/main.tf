/**
 * Queue Module
 * Creates SQS queue for vote processing
 */

resource "aws_sqs_queue" "vote_deadletter" {
  name                      = "${var.name_prefix}-vote-dlq"
  message_retention_seconds = 1209600  # 14 days
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-vote-dlq"
    }
  )
}

resource "aws_sqs_queue" "vote" {
  name                       = "${var.name_prefix}-vote-queue"
  delay_seconds              = 0
  max_message_size           = 262144  # 256 KB
  message_retention_seconds  = 345600  # 4 days
  visibility_timeout_seconds = 60
  receive_wait_time_seconds  = 10
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.vote_deadletter.arn
    maxReceiveCount     = 5
  })
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-vote-queue"
    }
  )
}