/**
 * ECR Module
 * Creates ECR repositories for container images
 */

resource "aws_ecr_repository" "backend" {
  name                 = "${var.name_prefix}-backend"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-backend"
    }
  )
}

resource "aws_ecr_repository" "frontend" {
  name                 = "${var.name_prefix}-frontend"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-frontend"
    }
  )
}

resource "aws_ecr_repository" "worker" {
  name                 = "${var.name_prefix}-worker"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-worker"
    }
  )
}

# Lifecycle policy to keep only the latest 5 images
resource "aws_ecr_lifecycle_policy" "lifecycle_policy" {
  for_each = {
    backend  = aws_ecr_repository.backend.name
    frontend = aws_ecr_repository.frontend.name
    worker   = aws_ecr_repository.worker.name
  }
  
  repository = each.value
  
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 5
      }
      action = {
        type = "expire"
      }
    }]
  })
}