# Fargate helper action

This action queries AWS Fargate tasks of an specific cluster and returns the public ip of the tasks

## Inputs

- cluster:
  - description: "Cluster arn"
- region:
  - description: "AWS region"
- serverGroup:
  - description: "Server task group matcher"
- telemetryGroup:
  - description: "Telemetry task group matcher"
- configGroup:
  - description: "Config task group matcher"

## Outputs

- server : server ip
- telemetry: telemetry ip
- configs: config ip

## Example usage
