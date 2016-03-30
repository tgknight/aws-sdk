'use strict'

var AWS = require('aws-sdk')
var _async = require('async')
var ec2

function Instance (region) {
  AWS.config.apiVersions = {
    ec2: '2015-10-01'
  }
  AWS.config.update({region: region})
  ec2 = new AWS.EC2()
}

Instance.allocateIp = function (callback) {
  return ec2.allocateAddress({ Domain: 'vpc' }, function (err, data) {
    if (err) callback(err, null)
    else {
      callback(null, {
        PublicIp: data.PublicIp,
        AllocationId: data.AllocationId
      })
    }
  })
}

Instance.associateIp = function (params, callback) {
  return ec2.associateAddress({
    AllocationId: params.AllocationId,
    AllowReassociation: false,
    NetworkInterfaceId: params.NetworkInterfaceId
  }, function (err, data) {
    if (err) callback(err, null)
    else callback(null, { AssociationId: data.AssociationId })
  })
}

Instance.createSecurityGroup = function (params, callback) {
  return ec2.createSecurityGroup({
    Description: 'Security group for datana',
    GroupName: 'datana-' + new Date().getTime(),
    VpcId: params.VpcId
  }, function (err, data) {
    if (err) callback(err, null)
    else {
      callback(null, { GroupId: data.GroupId })
    }
  })
}

Instance.createVpc = function (callback) {
  return ec2.createVpc({ CidrBlock: '10.240.0.0/24' }, function (err, data) {
    if (err) callback(err, null)
    else {
      callback(null, {
        CidrBlock: data.Vpc.CidrBlock,
        VpcId: data.Vpc.VpcId
      })
    }
  })
}

Instance.createSubnet = function (params, callback) {
  return ec2.createSubnet({
    CidrBlock: params.CidrBlock,
    VpcId: params.VpcId
  }, function (err, data) {
    if (err) callback(err, null)
    else callback(null, { SubnetId: data.Subnet.SubnetId })
  })
}

Instance.createNetworkInterface = function (params, callback) {
  return ec2.createNetworkInterface({
    SubnetId: params.SubnetId,
    Groups: [ params.GroupId ]
  }, function (err, data) {
    if (err) callback(err, null)
    else callback(null, { NetworkInterfaceId: data.NetworkInterface.NetworkInterfaceId })
  })
}

Instance.createSubnetAndSecurityGroup = function (params, callback) {
  _async.parallel([
    function (callback) {
      Instance.createSubnet(params, callback)
    },
    function (callback) {
      Instance.createSecurityGroup(params, callback)
    }
  ], function (err, results) {
    if (err) callback(err, null)
    else {
      callback(null, {
        SubnetId: results[0].SubnetId,
        GroupId: results[1].GroupId
      })
    }
  })
}

Instance.createNetworkInterfaceAndAllocateIp = function (params, callback) {
  _async.parallel([
    function (callback) {
      Instance.allocateIp(callback)
    },
    function (callback) {
      Instance.createNetworkInterface(params, callback)
    }
  ], function (err, results) {
    if (err) callback(err, null)
    else {
      callback(null, {
        AllocationId: results[0].AllocationId,
        NetworkInterfaceId: results[1].NetworkInterfaceId
      })
    }
  })
}

Instance.prototype.initNetwork = function (params) {
  _async.waterfall([
    Instance.createVpc,
    Instance.createSubnetAndSecurityGroup,
    Instance.createNetworkInterfaceAndAllocateIp,
    Instance.associateIp
  ], function (err, result) {
    if (err) {
      console.log(err)
      return err
    }
    console.log(result)
    return result
  })
}

Instance.runInstance = function (params, callback) {
  return ec2.runInstances({
    ImageId: 'ami-25c00c46',
    MaxCount: 1,
    MinCount: 1,
    ClientToken: 'SERTISCOLTD',
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
    Placement: {
      AvailabilityZone: params.zone + 'a'
    },
    SecurityGroupsIds: [
      params.GroupId
    ],
    UserData: '#!/bin/bash\necho "aws"'
  }, callback)
}

/**
 * params: { name, zone, keyName, instanceType }
 * callback: function
 */
Instance.prototype.create = function (params, callback) {}

module.exports = Instance
