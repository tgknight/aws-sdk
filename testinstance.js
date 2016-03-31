'use strict'

/* api/instance/network */
/* var Network = require('./api/instance/network')
var network = new Network('ap-southeast-1')

network.initNetwork({CidrBlock: '10.10.0.0/24'}, function (err, res) {
  if (err) console.log(err)
  else console.log(res)
}) */

/* api/instance/instance */
var fs = require('fs')
var base64 = require('base64it')
var Instance = require('./api/instance/instance')
var instance = new Instance('ap-southeast-1')

fs.readFile(process.cwd() + '/script.sh', 'utf8', function (err, data) {
  if (err) console.log(err)
  else {
    instance.create({
      CidrBlock: '10.10.0.0/24',
      InstanceName: 'datana01',
      InstanceType: 't2.micro',
      UserData: base64.encode(data),
      KeyName: 'top'
    }, function (err, res) {
      if (err) console.log(err)
      else console.log(res)
    })
  }
})
