# ROSTR Agent — AWS Infrastructure as Code
# DynamoDB, S3, Lambda, API Gateway, Cognito Auth

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  default = "us-east-1"
}

variable "environment" {
  default = "prod"
}

variable "app_name" {
  default = "rostr-agent"
}

# DynamoDB Tables
resource "aws_dynamodb_table" "users" {
  name           = "${var.app_name}-users-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Environment = var.environment
    App         = var.app_name
  }
}

resource "aws_dynamodb_table" "workspaces" {
  name           = "${var.app_name}-workspaces-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "workspace"

  attribute {
    name = "workspace"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "user-index"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  tags = {
    Environment = var.environment
    App         = var.app_name
  }
}

resource "aws_dynamodb_table" "hub_entries" {
  name           = "${var.app_name}-hub-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "workspace"
  range_key      = "entryId"

  attribute {
    name = "workspace"
    type = "S"
  }

  attribute {
    name = "entryId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  global_secondary_index {
    name            = "timestamp-index"
    hash_key        = "workspace"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Environment = var.environment
    App         = var.app_name
  }
}

resource "aws_dynamodb_table" "executions" {
  name           = "${var.app_name}-executions-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "workspace"
  range_key      = "executionId"

  attribute {
    name = "workspace"
    type = "S"
  }

  attribute {
    name = "executionId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  global_secondary_index {
    name            = "timestamp-index"
    hash_key        = "workspace"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Environment = var.environment
    App         = var.app_name
  }
}

# S3 Bucket for workspace exports
resource "aws_s3_bucket" "workspace_exports" {
  bucket = "${var.app_name}-exports-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Environment = var.environment
    App         = var.app_name
  }
}

resource "aws_s3_bucket_versioning" "workspace_exports" {
  bucket = aws_s3_bucket.workspace_exports.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "workspace_exports" {
  bucket = aws_s3_bucket.workspace_exports.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Cognito User Pool for auth
resource "aws_cognito_user_pool" "main" {
  name = "${var.app_name}-userpool-${var.environment}"

  password_policy {
    minimum_length    = 12
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  tags = {
    Environment = var.environment
    App         = var.app_name
  }
}

resource "aws_cognito_user_pool_client" "main" {
  name                = "${var.app_name}-client"
  user_pool_id        = aws_cognito_user_pool.main.id
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]

  allowed_oauth_flows            = ["code", "implicit"]
  allowed_oauth_scopes           = ["email", "openid"]
  allowed_oauth_flows_user_pool_client = true
  callback_urls                  = ["https://rostr.diamitani.com/callback"]
  logout_urls                    = ["https://rostr.diamitani.com/logout"]

  prevent_user_existence_errors = "ENABLED"
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.app_name}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.app_name}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.workspaces.arn,
          aws_dynamodb_table.hub_entries.arn,
          aws_dynamodb_table.executions.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          "${aws_dynamodb_table.workspaces.arn}/index/*",
          "${aws_dynamodb_table.hub_entries.arn}/index/*",
          "${aws_dynamodb_table.executions.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = "${aws_s3_bucket.workspace_exports.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = "*"
      }
    ]
  })
}

# Outputs
data "aws_caller_identity" "current" {}

output "dynamodb_tables" {
  value = {
    users       = aws_dynamodb_table.users.name
    workspaces  = aws_dynamodb_table.workspaces.name
    hub_entries = aws_dynamodb_table.hub_entries.name
    executions  = aws_dynamodb_table.executions.name
  }
}

output "s3_bucket" {
  value = aws_s3_bucket.workspace_exports.id
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.main.id
}
