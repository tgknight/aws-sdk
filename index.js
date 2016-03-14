'use strict'

var async = require('async')

var AWS = require('aws-sdk')
AWS.config.region = 'ap-southeast-1'

var s3 = new AWS.S3()
var emr = new AWS.EMR()

var bucketName = 'datana-' + (new Date()).getTime()
var jobFlowId, jobStatus

var createBucketParams = {
  Bucket: bucketName,
  CreateBucketConfiguration: {
    LocationConstraint: 'ap-southeast-1'
  }
}

var jobFlowParams = {
	Instances: {
    Ec2KeyName: 'top',
    InstanceCount: 1,
    KeepJobFlowAliveWhenNoSteps: true,
    MasterInstanceType: 'm3.xlarge',
    Placement: {
      AvailabilityZone: 'ap-southeast-1a'
    },
    SlaveInstanceType: 'm3.xlarge',
    TerminationProtected: true
  },
  Name: bucketName,
  Applications: [
    {
      Name: 'Spark'
    },
  ],
  JobFlowRole: 'EMR_EC2_DefaultRole',
  LogUri: 's3n://' + bucketName + '/emr-log',
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

async.series([
  function (cb) {
    s3.createBucket(createBucketParams, function (err, data) {
      if (err) {
        console.log(err + '\n' + err.stack)
        cb(err, null)
      } else {
        console.log('bucket created', data)
        cb(null, data)
      }
    })
  },
  function (cb) {
    emr.runJobFlow(jobFlowParams, function (err, data) {
      if (err) {
        console.log(err + '\n' + err.stack)
        cb(err, null)
      } else {
        console.log('cluster created')
        jobFlowId = data.JobFlowId
        cb(null, data)
      }
    })
  },
  function (cb) {
    async.until(
      function () { return jobStatus === 'WAITING' },
      function (cb) {
        emr.describeCluster({ ClusterId: jobFlowId }, function (err, data) {
          if (err) {
            cb(err, null)
          } else {
            jobStatus = data.Cluster.Status.State
            console.log(jobStatus)
            cb(null, data)
          }
        })
      },
      function (err, data) {
        if (err) {
          console.log(err + '\n' + err.stack)
          cb(err, null)
        } else {
          console.log(data)
          cb(null, data)
        }
      }
    )
  }
], function (err, results) {
  if (err) {
    console.log('An error has occurred')
  } else {
    console.log('Done\n' + results)
  }
})


