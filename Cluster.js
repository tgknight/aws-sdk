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
 */
Cluster.prototype.create = function (params) {
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

  return emr.runJobFlow(jobFlowParams, function (err, data) {
    if (err) {
      return { err: err }
    } else {
      return { data: data.JobFlowId }
    }
  })
}

Cluster.prototype.delete = function (jobFlowId) {
  return emr.terminateJobFlows({
    JobFlowIds: [ jobFlowId ]
  }, function (err, data) {
    if (err) {
      return { err: err }
    } else {
      return { data: data }
    }
  })
}

Cluster.prototype.getClusterInfo = function (jobFlowId) {
  return emr.describeCluster({
    ClusterId: jobFlowId
  }, function (err, data) {
    if (err) {
      return { err: err }
    } else {
      return { data: data }
    }
  })
}

module.exports = Cluster
