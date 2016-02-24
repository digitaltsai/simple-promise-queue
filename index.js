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

  SuperQueue.apply(self, arguments);

  if (typeof options !== 'undefined') {
    if (options.autoStart === true) {
      ['push', 'unshift'].forEach(function(method) {
        var old = self[method];
        self[method] = function() {
          old.apply(self, arguments);
          if (self.jobs.length && self.running === false) {
            self.start();
          }
        };
      });
    }

    self.on('end', function() {
      if (self.jobs.length && self.running === false) {
        self.start();
      }
    });
  }
};

util.inherits(Queue, SuperQueue);

// helper functions
var insertQueue = function insertQueue(queue, method, promiseFunction) {
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

    queue[method](wrapperFunction);
  });
};

// Public methods below
Queue.prototype.pushTask = function pushTask(promiseFunction) {
  return insertQueue(this, 'push', promiseFunction);
};

Queue.prototype.unshiftTask = function pushTask(promiseFunction) {
  return insertQueue(this, 'unshift', promiseFunction);
};

module.exports = Queue;
