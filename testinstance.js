'use strict'

var Network = require('./api/instance/network')
var network = new Network('ap-southeast-1')

// network.test({CidrBlock: '10.10.0.0/24'})
network.initNetwork({CidrBlock: '10.10.0.0/24'})
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
