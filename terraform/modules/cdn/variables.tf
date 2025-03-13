variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "domain_name" {
  description = "Main domain name for the frontend"
  type        = string
}

variable "api_domain" {
  description = "Domain name for the API"
  type        = string
}

variable "alb_domain" {
  description = "Domain of the ALB"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}