"use strict";

const core = require("@actions/core");

try {
  // `who-to-greet` input defined in action metadata file
  const awsRegion = core.getInput("region");
  const clusterArn = core.getInput("cluster");

  const AWS = require("aws-sdk");
  const ec2 = new AWS.EC2({ region: awsRegion });
  const ecs = new AWS.ECS({ region: awsRegion });

  // task group matchers
  const serverGroup = core.getInput("serverGroup");
  const telemetryGroup = core.getInput("telemetryGroup");
  const configGroup = core.getInput("configGroup");

  const taskDefs = {
    server: serverGroup,
    telemetry: telemetryGroup,
    configs: configGroup,
  };

  const getTaskLists = async (cluster) => {
    return ecs.listTasks({ cluster: cluster }).promise();
  };

  const getTasksDetails = async (cluster, taskList) => {
    return ecs
      .describeTasks({
        cluster: cluster,
        tasks: taskList.taskArns,
        include: ["TAGS"],
      })
      .promise();
  };

  const fetchPublicIps = async (taskDetails) => {
    const taskInfo = {};

    for (const serviceName of Object.keys(taskDefs)) {
      //Object.keys(taskDefs).forEach((serviceName) => {
      const serviceDef = taskDetails.tasks.find(
        (item) => item.group && item.group.includes(taskDefs[serviceName])
      );
      if (serviceName) {
        const eni = extractEni(serviceDef);
        if (eni) {
          taskInfo[serviceName] = await fetchEniPublicIp(eni);
        }
      }
    }

    return taskInfo;
  };

  const ipDiscovery = async () => {
    const taskList = await getTaskLists(clusterArn);
    const tasksDetails = await getTasksDetails(clusterArn, taskList);
    const publicIps = await fetchPublicIps(tasksDetails);
    return publicIps;
  };

  function extractEni(taskInfo) {
    if (
      !taskInfo ||
      !taskInfo.attachments ||
      !taskInfo.attachments ||
      taskInfo.attachments.length < 0
    ) {
      return;
    }
    const attachment = taskInfo.attachments[0];
    const eniObject = attachment.details.find(
      (item) => item.name === "networkInterfaceId"
    );
    if (eniObject) {
      return eniObject.value;
    }
  }

  async function fetchEniPublicIp(eniId) {
    const data = await ec2
      .describeNetworkInterfaces({
        NetworkInterfaceIds: [eniId],
      })
      .promise();

    return data.NetworkInterfaces[0].PrivateIpAddresses[0].Association.PublicIp;
  }

  // main
  ipDiscovery()
    .then((data) => {
      core.setOutput("server", data.server);
      core.setOutput("telemetry", data.telemetry);
      core.setOutput("configs", data.configs);
    })
    .catch((error) => core.setFailed(error.message));
} catch (error) {
  core.setFailed(error.message);
}
