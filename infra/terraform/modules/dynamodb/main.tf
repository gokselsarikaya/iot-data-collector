# modules/dynamodb/main.tf

resource "aws_dynamodb_table" "telemetry" {
  name           = "telemetry-data"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "deviceId"
  
  attribute {
    name = "deviceId"
    type = "S"
  }

}

output "table_name" {
  value = aws_dynamodb_table.telemetry.name
}

output "table_arn" {
  value = aws_dynamodb_table.telemetry.arn
}
