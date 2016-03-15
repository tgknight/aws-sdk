'use strict'

var AWS = require('aws-sdk')
var s3

function Bucket (region) {
  AWS.config.apiVersions = {
    s3: '2006-03-01'
  }
  AWS.config.update({ region: region })
  s3 = new AWS.S3()
}

/*
 * params: {name, region}
 */
Bucket.prototype.create = function (params) {
  return s3.createBucket({
    Bucket: params.name,
    CreateBucketConfiguration: {
      LocationConstraint: params.region
    }
  }, function (err, data) {
    if (err) {
      return { err: err }
    } else {
      return { data: data }
    }
  })
}

/*
 * params: {bucket, name, data}
 */
Bucket.prototype.upload = function (params) {
  var uploadParams = {
    Bucket: params.bucket,
    Key: params.name,
    Body: params.data
  }

  return s3.putObject(uploadParams, function (err, data) {
    if (err) {
      return { err: err }
    } else {
      return { data: data }
    }
  })
}

module.exports = Bucket
