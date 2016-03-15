'use strict'

var async = require('async')
var Cluster = require('./Cluster')
var Bucket = require('./Bucket')

var bucketName = 'datana-' + (new Date()).getTime()
var region = 'ap-southeast-1'
var jobFlowId

var cluster = new Cluster(region)
var bucket = new Bucket(region)

async.series([
  function (cb) {
    var res = bucket.create({
      name: bucketName,
      region: region
    })
    if (res.err) {
      console.log(err + '\n' + err.stack)
      cb(res.err, null)
    } else {
      cb(null, res.data)
    }
  },
  function (cb) {
    var res = bucket.upload({
      bucket: bucketName,
      name: 'data/test.txt',
      data: 'test uploading'
    })
    if (res.err) {
      console.log(err + '\n' + err.stack)
      cb(res.err, null)
    } else {
      cb(null, res.data)
    }
  },
  function (cb) {
    var res = cluster.create({
      name: bucketName,
      zone: region + 'a',
      keyname: 'top',
      masterInstanceType: 'm3.xlarge',
      slaveInstanceType: 'm3.xlarge'
    })
    if (res.err) {
      cb(res.err, null)
    } else {
      jobFlowId = res.data.jobFlowId
      cb(null, res.data)
    }
  },
  function (cb) {
    var jobStatus
    async.until(
      function () { return jobStatus === 'WAITING' },
      function (callback) {
        var res = cluster.getClusterInfo(jobFlowId)
        if (res.err) {
          callback(res.err, null)
        } else {
          callback(null, res.data)
        }
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
    console.log('An error has occurred\n' + err)
  } else {
    console.log('Done\n' + results)
  }
})


