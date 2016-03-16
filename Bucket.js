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
 * callback: function
 */
Bucket.prototype.create = function (params, callback) {
  var bucketParams = {
    Bucket: params.name,
    CreateBucketConfiguration: {
      LocationConstraint: params.region
    }
  }
  return s3.createBucket(bucketParams, callback)
}


/*
 * params: {bucket, name, data}
 * callback: function
 */
Bucket.prototype.upload = function (params, callback) {
  var uploadParams = {
    Bucket: params.bucket,
    Key: params.name,
    Body: params.data
  }

  return s3.putObject(uploadParams, callback)
}

module.exports = Bucket
