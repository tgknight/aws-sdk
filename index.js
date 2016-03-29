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
    bucket.create({
      name: bucketName,
      region: region
    }, function (err, data) {
      if (err) {
        cb(err, null)
      } else {
        cb(null, data)
      }
    })
  },
  /*function (cb) {
    bucket.upload({
      bucket: bucketName,
      name: 'temp/hellos3.py',
      data: 'print "hello from s3"'
    }, function (err, data) {
      if (err) {
        cb(err, null)
      } else {
        cb(null, data)
      }
    })
  },*/
  function (cb) {
    cluster.create({
      name: bucketName,
      zone: region + 'a',
      keyName: 'top',
      masterInstanceType: 'm3.xlarge',
      slaveInstanceType: 'm3.xlarge'
    }, function (err, data) {
      if (err) {
        cb(err, null)
      } else {
        jobFlowId = data.JobFlowId
        cb(null, data)
      }
    })
  },
  function (cb) {
    var jobStatus, count = 0
    async.until(
      function () { return jobStatus === 'WAITING' },
      function (callback) {
        setTimeout(function () {
          cluster.getClusterInfo(jobFlowId,
            function (err, data) {
              if (err) {
                callback(err, null)
              } else {
                jobStatus = data.Cluster.Status.State
                process.stdout.write('Cluster status: ' + jobStatus + ' #' + ++count + '\r')
                callback(null, data)
              }
            })
        }, 1000)
      },
      function (err, data) {
        if (err) {
          cb(err, null)
        } else {
          cb(null, data)
        }
      }
    )
  }
], function (err, results) {
  if (err) {
    console.log('An error has occurred\n' + err.stack)
  } else {
    console.log('Done')
  }
  console.log(results)
})


