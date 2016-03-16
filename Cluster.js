'use strict'

var AWS = require('aws-sdk')
var emr

function Cluster (region) {
  AWS.config.apiVersions = {
    emr: '2009-03-31'
  }
  AWS.config.update({ region: region })
  emr = new AWS.EMR()
}

/**
 * params: { name, zone, keyName, masterInstanceType, slaveInstanceType }
 * callback: function
 */
Cluster.prototype.create = function (params, callback) {
  var jobFlowParams = {
    Instances: {
      Ec2KeyName: params.keyName,
      InstanceCount: 1,
      KeepJobFlowAliveWhenNoSteps: true,
      MasterInstanceType: params.masterInstanceType,
      Placement: {
        AvailabilityZone: params.zone
      },
      SlaveInstanceType: params.slaveInstanceType,
      TerminationProtected: true
    },
    Name: params.name,
    Applications: [
      {
        Name: 'Spark'
      },
    ],
    JobFlowRole: 'EMR_EC2_DefaultRole',
    LogUri: 's3n://' + params.name + '/emr-log',
    ReleaseLabel: 'emr-4.3.0',
    ServiceRole: 'EMR_DefaultRole',
    Tags: [
      {
        Key: 'targetTag',
        Value: 'datana'
      },
    ],
    VisibleToAllUsers: true
  }

  return emr.runJobFlow(jobFlowParams, callback)
}

Cluster.prototype.delete = function (jobFlowId, callback) {
  return emr.terminateJobFlows({
    JobFlowIds: [ jobFlowId ]
  }, callback)
}

Cluster.prototype.getClusterInfo = function (jobFlowId, callback) {
  return emr.describeCluster({
    ClusterId: jobFlowId
  }, callback)
}

module.exports = Cluster
