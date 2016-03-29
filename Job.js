'use strict'

var AWS = require('aws-sdk')
var emr

function Job (region) {
  AWS.config.apiVersions = {
    emr: '2009-03-31'
  }
  AWS.config.update({ region: region })
  emr = new AWS.EMR()

  this.region = region
}

/*
 * params: {jobFlowId, jobName, pysparkScript}
 */
Job.prototype.submit = function (params, callback) {
  var jobParams = {
    JobFlowId: params.jobFlowId,
    Steps: [{
      HadoopJarStep: {
        Jar: 's3://elasticmapreduce/libs/script-runner/script-runner.jar',
        Args: [
          '/usr/lib/spark/bin/spark-submit',
          '--deploy-mode',
          'cluster',
          params.pysparkScript
        ]
      },
      Name: params.jobName,
      ActionOnFailure: 'CANCEL_AND_WAIT'
    }]
  }

  return emr.addJobFlowSteps(jobParams, callback)
}

Job.prototype.cancel = function (params, callback) {
}

Job.prototype.get = function (params, callback) {
}

module.exports = Job
