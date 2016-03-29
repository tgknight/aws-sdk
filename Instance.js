'use strict'

var AWS = require('aws-sdk')
var ec2

function Instance (region) {
  AWS.config.apiVersions = {
    ec2: '2015-10-01'
  }
  AWS.config.update({region: region})
  ec2 = new AWS.EC2()
}

Instance.prototype.getImages = function (callback) {
  var imageParams = {
    DryRun: false,
    ImageIds: ['ami-25c00c46'],
    ExecutableUsers: ['all'],
    Owners: ['099720109477'],
    Filters: [{
      Name: 'architecture',
      Values: ['x86_64']
    }, {
      Name: 'image-type',
      Values: ['machine']
    }, {
      Name: 'state',
      Values: ['available']
    }]
  }
  return ec2.describeImages(imageParams, callback)
}

/**
 * params: { name, zone, keyName, instanceType }
 * callback: function
 */
Instance.prototype.create = function (params, callback) {
  var instanceParams = {
    ImageId: 'ami-25c00c46',
    MaxCount: 1,
    MinCount: 1,
    ClientToken: 'SERTISCOLTD',
    DisableApiTermination: false,
    DryRun: true,
    InstanceInitiatedShutdownBehavior: 'terminate',
    InstanceType: params.instanceType,
    KeyName: params.keyName,
    Monitoring: {
      Enabled: true
    },
    NetworkInterfaces: [{
      NetworkInterfaceId: 'someNetworkInterfaceId',
      DeviceIndex: 0
    }]
  }
  return ec2.runInstances(instanceParams, callback)
}

module.exports = Instance
