variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where security groups will be created"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "enable_waf_logging" {
  description = "Enable WAF logging to CloudWatch"
  type        = bool
  default     = true
}

variable "alb_arn" {
  description = "ARN of the Application Load Balancer to associate the WAF with"
  type        = string
  default     = ""
}

variable "api_gateway_stage_arn" {
  description = "ARN of the API Gateway stage to associate the WAF with"
  type        = string
  default     = ""
}