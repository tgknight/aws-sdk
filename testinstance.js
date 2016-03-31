'use strict'

var Network = require('./api/instance/network')
var network = new Network('ap-southeast-1')

/* var base64 = require('base64-js')
var Instance = require('./api/instance/instance')
var instance = new Instance('ap-southeast-1')

instance.create({
  CidrBlock: '10.10.0.0/24',
  InstanceName: 'datana01',
  InstanceType: 't2.micro',
  // ClientToken: 'SERTISCOLTD',
  UserData: base64.fromByteArray('#!/bin/bash\necho "test ja" > ~/test.txt'),
  KeyName: 'top'
}, function (err, res) {
  if (err) console.log(err)
  else console.log(res)
}) */
// network.test({CidrBlock: '10.10.0.0/24'})
network.initNetwork({CidrBlock: '10.10.0.0/24'}, function (err, res) {
  if (err) console.log(err)
  else console.log(res)
})
// var Instance = require('./Instance')
// var instance = new Instance('ap-southeast-1')

/* instance.getImages(function (err, images) {
  if (err) {
    console.log(err)
  } else {
    console.log(images)
  }
}) */

/* instance.create({
  keyname: 'top',
  instanceType: 't2.micro'
}, function (err, instance) {
  if (err) {
    console.log(err)
  } else {
    console.log(instance)
  }
}) */

// instance.initNetwork({zone: 'ap-southeast-1'})
