output "thing_name" {
  value = aws_iot_thing.device.name
}

output "sqs_queue_url" {
  value = aws_sqs_queue.iot_queue.id
}

output "certificate_arn" {
  value = aws_iot_certificate.cert.arn
}
