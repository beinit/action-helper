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

```yml
on: [push]

jobs:
  fargate-test:
    runs-on: ubuntu-latest
    name: Retrieve public IPs
    steps:
      - name: fargate-helper
        id: fargate
        uses: beinit/action-helper@v1
        with:
          cluster: arn:aws:ecs:us-east-2:481218820000:cluster/XYZ
          region: us-east-2
          serverGroup: platform-qa
          telemetryGroup: telemetry-qa
          configGroup: XYZ-configs
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: print the output
        run: echo "Server IP ${{ steps.fargate.outputs.server }}"
```
