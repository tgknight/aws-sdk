'use strict'

var Instance = require('./Instance')
var instance = new Instance('ap-southeast-1')

instance.getImages(function (err, images) {
  if (err) {
    console.log(err)
  } else {
    console.log(images)
  }
})

instance.create({
  keyname: 'top',
  instanceType: 't2.micro'
}, function (err, instance) {
  if (err) {
    console.log(err)
  } else {
    console.log(instance)
  }
})
