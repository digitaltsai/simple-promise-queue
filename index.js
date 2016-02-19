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
  return new QueuePromise(function(resolve, reject) {
    // this function will do the right promise
    var wrapperFunction = function(done) {
      new QueuePromise(promiseFunction).then(function(value) {
        setImmediate(function() {
          resolve(value);
        });
        done();
      }, function(reason) {
        setImmediate(function() {
          reject(reason);
        });
        done();
      }).then(resolve, reject);
    };

    self.push(wrapperFunction);
  });
};

module.exports = Queue;

var queue = new Queue({
  autoStart: true,
  concurrency: 1
});

var job1Part1 = queue.pushTask(function(resolve, reject) {
  // some limited resource async task that takes 5 seconds
  setTimeout(function() {
    console.log('done with promise');
    resolve('promise 1 done');
  }, 1000)
}).then(function() {
  console.log('test then');
});;

var job2 = queue.push(function(done) {
  console.log('test2');
  done();
});

var job3 = queue.push(function(done) {
  console.log('test3');
  done();
});
