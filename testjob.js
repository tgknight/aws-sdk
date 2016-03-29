'use strict'

var fs = require('fs')
var async = require('async')
var Job = require('./Job')
var Bucket = require('./Bucket')

var region = 'ap-southeast-1'
var job = new Job(region)
var bucket = new Bucket(region)

var jobFlowId = 'j-2QCAFR1UOR1UL'
var bucketName = 'datana-1458198192679'
var sourcePath = 'MOCK_DATA.csv'
var scriptPath = 'upload.py'
var uploadPath = 'temp/' + scriptPath

async.waterfall([
  // read raw data
  function (cb) {
    fs.readFile(sourcePath, 'utf8', function (err, data) {
      if (err) {
        cb(err, null)
      } else {
        var headerRaw = data.slice(0, data.indexOf('\n'))
        headerRaw = headerRaw.split(',')
        var body = data.slice(data.indexOf('\n') + 1)
        // extract header
        var header = ''
        for (var i in headerRaw) {
          header += headerRaw[i] + ' STRING, '
        }
        header = header.slice(0, -2)
        cb(null, header, body)
      }
    })
  },
  // upload body
  function (header, body, cb) {
    var uploadParams = {
      bucket: bucketName,
      name: 'upload/mockdata/mockdata',
      data: body
    }

    bucket.upload(uploadParams, function (err, data) {
      if (err) {
        cb(err, null)
      } else {
        cb(null, header)
      }
    })
  },
  // modify scripts
  function (header, cb) {
    fs.readFile(scriptPath, 'utf8', function (err, data) {
      if (err) {
        cb(err, null)
      } else {
        var processed = data.replace(/{{tableName}}/g, 'mockdata')
                            .replace(/{{header}}/g, header)
                            .replace(/{{delimiter}}/g, ',')
                            .replace(/{{location}}/g, 's3://' + bucketName + '/upload/mockdata')
        cb(null, processed)
      }
    })
  },
  function (content, cb) {
    var uploadParams = {
      bucket: bucketName,
      name: uploadPath,
      data: content
    }

    bucket.upload(uploadParams, function (err, data) {
      if (err) {
        cb(err, null)
      } else {
        cb(null)
      }
    })
  },
  function (cb) {
    var jobParams = {
      jobFlowId: jobFlowId,
      jobName: scriptPath.slice(0, scriptPath.indexOf('.')),
      pysparkScript: 's3://' + bucketName + '/' + uploadPath
    }

    job.submit(jobParams, function (err, data) {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(data)
      }
    })
  }
], function (err, results) {
  if (err) {
    console.log(err.stack)
  }
  console.log(results)
})

