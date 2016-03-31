'use strict'

var AWS = require('aws-sdk')
var _ = require('lodash')
var _async = require('async')
var Network = require('./network')
var network, ec2

function Instance (region) {
  AWS.config.apiVersions = {
    ec2: '2015-10-01'
  }
  AWS.config.update({region: region})
  ec2 = new AWS.EC2()
  network = new Network(region)
}

Instance.runInstance = function (params, callback) {
  ec2.runInstances({
    ImageId: 'ami-25c00c46',
    MaxCount: 1,
    MinCount: 1,
    DisableApiTermination: false,
    InstanceInitiatedShutdownBehavior: 'terminate',
    InstanceType: params.InstanceType,
    KeyName: params.KeyName,
    Monitoring: {
      Enabled: true
    },
    NetworkInterfaces: [{
      NetworkInterfaceId: params.NetworkInterfaceId,
      DeviceIndex: 0
    }],
    UserData: params.UserData
  }, function (err, data) {
    if (err) callback(err, null)
    else callback(null, data)
  })
}

Instance.prototype.create = function (params, callback) {
  _async.waterfall([
    function (callback) {
      network.initNetwork({ CidrBlock: params.CidrBlock }, function (err, result) {
        if (err) callback(err, null)
        else callback(null, _.merge(params, result))
      })
    },
    function (instanceParams, callback) {
      Instance.runInstance(instanceParams, function (err, result) {
        if (err) callback(err, null)
        else callback(null, result.Instances[0])
      })
    },
    function (instance, callback) {
      ec2.createTags({
        Resources: [ instance.InstanceId ],
        Tags: [ { Key: 'Name', Value: params.InstanceName } ]
      }, function (err, data) {
        if (err) callback(err, null)
        else callback(null, instance)
      })
    }
  ], function (err, result) {
    if (err) callback(err, null)
    else callback(null, result)
  })
}

module.exports = Instance
