# modules/apps/main.tf
module "ecr" {
  source = "terraform-aws-modules/ecr/aws"

  repository_name = "device-api"
  
  # Add lifecycle policy
  create_lifecycle_policy = true
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire images older than 30 days"
        selection = {
          tagStatus   = "any"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 30
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}