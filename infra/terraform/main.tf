provider "aws" {
  region = var.region
}

module "vpc" {
  source = "./modules/vpc"
}

module "iot" {
  source = "./modules/iot"
  dynamodb_table_name = module.dynamodb.table_name
  dynamodb_table_arn = module.dynamodb.table_arn
}

module "dynamodb" {
  source = "./modules/dynamodb"
}

module "apps" {
  source = "./modules/apps"
}

/* module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "20.8.3"
  cluster_name    = var.cluster_name
  cluster_version = "1.29"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids

  eks_managed_node_groups = {
    default = {
      desired_size    = 2
      max_size        = 3
      min_size        = 1
      instance_types  = ["t3.medium"]
    }
  }
} */


