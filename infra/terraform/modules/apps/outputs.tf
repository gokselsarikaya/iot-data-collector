# modules/apps/outputs.tf
output "ecr_repository_url" {
  value = module.ecr.repository_url
}