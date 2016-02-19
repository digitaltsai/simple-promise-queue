'use strict';

// module dependencies
var SuperQueue = require('queue');
var util = require('util');

// here in case you want to use your own Promise
var QueuePromise;
if (typeof Promise !== 'undefined') {
  QueuePromise = Promise;
} else {
  QueuePromise = function() {
    // this only happens if you don't have Promise
    throw new Error('Must call Queue.setPromise() first');
  };
}

QueuePromise.setPromise = function(CustomPromise) {
  QueuePromise = CustomPromise;
};

// Just inherit everything form https://www.npmjs.com/package/queue
var Queue = function(options) {
  var self = this;
  self.Promise = Promise;

  SuperQueue.apply(self, arguments);

  if (typeof options !== 'undefined') {
    if (options.autoStart === true) {
      var oldPush = self.push;
      self.push = function() {
        if (oldPush.apply(self, arguments) > 0) {
          self.start();
        }
      };
    }

    if (options.Promise !== 'undefined') {
      self.Promise = options.Promise;
    }
  }
};

util.inherits(Queue, SuperQueue);

Queue.prototype.pushTask = function(promiseFunction) {
  var self = this;
  // this promise will not be resolved till the delayed
  // promise is resolved/rejected
  return new QueuePromise(function(resolve, reject) {
    // this function will create the promise when its time to
    var wrapperFunction = function(done) {
      new QueuePromise(promiseFunction).then(function(value) {
        done();
        return value;
      }, function(reason) {
        done();
        throw reason;
      }).then(resolve, reject);
    };

    self.push(wrapperFunction);
  });
};

module.exports = Queue;
