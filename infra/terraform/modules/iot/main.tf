resource "aws_iot_thing" "device" {
  name = "my-iot-device"
}

resource "aws_iot_policy" "policy" {
  name   = "iot-policy"
  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["iot:*"],
      "Resource": "*"
    }]
  })
}

# First create a certificate
resource "aws_iot_certificate" "cert" {
  active = true
}

resource "aws_iot_thing_principal_attachment" "attachment" {
  principal = aws_iot_certificate.cert.arn
  thing     = aws_iot_thing.device.name
}

resource "aws_iot_topic_rule" "forward_to_dynamodb" {
    name        = "forward_to_dynamodb_rule"
  enabled     = true
  sql         = "SELECT *, deviceId FROM 'device/telemetry'"
  sql_version = "2016-03-23"

  dynamodb {
    table_name      = var.dynamodb_table_name
    role_arn        = aws_iam_role.iot_role.arn
    hash_key_field  = "deviceId"
    hash_key_value  = "$${deviceId}"
    payload_field   = "payload"
  }
}

resource "aws_iam_role" "device_role" {
  name = "device-role"
  
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [{
      "Action" : "sts:AssumeRole",
      "Principal" : {
        "Service" : "iot.amazonaws.com"
      },
      "Effect" : "Allow",
      "Sid" : ""
    }]
  })
}

# IoT -> DynamoDB için rol
resource "aws_iam_role" "iot_role" {
  name = "iot-role"
  
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [{
      "Action" : "sts:AssumeRole",
      "Principal" : {
        "Service" : "iot.amazonaws.com"
      },
      "Effect" : "Allow",
      "Sid" : ""
    }]
  })
}


resource "aws_iam_role_policy" "iot_dynamodb_policy" {
  name = "iot-dynamodb-policy"
  role = aws_iam_role.iot_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:*",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ]
        Resource = var.dynamodb_table_arn
      }
    ]
  })
}

# SQS kuyruğu
resource "aws_sqs_queue" "iot_queue" {
  name = "iot-message-queue"
}

# IoT -> SQS için rol
resource "aws_iam_role" "iot_sqs_role" {
  name = "iot-sqs-role"
  assume_role_policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": { "Service": "iot.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "iot_sqs_policy" {
  name = "iot-sqs-policy"
  role = aws_iam_role.iot_sqs_role.id
  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["sqs:SendMessage"],
      "Resource": aws_sqs_queue.iot_queue.arn
    }]
  })
}

resource "aws_iot_topic_rule" "forward_to_sqs" {
  name        = "forward_to_sqs"
  enabled     = true
  sql         = "SELECT * FROM 'device/telemetry'"
  sql_version = "2016-03-23"

  sqs {
    role_arn   = aws_iam_role.iot_sqs_role.arn
    queue_url  = aws_sqs_queue.iot_queue.id
    use_base64 = false
  }
}