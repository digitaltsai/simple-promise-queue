This is a simple queue where you can push a `function(resolve, reject)` to a queue and
get a promise that references that task.

## Install
`npm install simple-promise-queue`

## Use Cases
* Use case #1: Throttled `Promise.all`
* Use case #2: Used as a task queuer to grab a resource with limited connection pools

## How to use

`Queue.pushTask(function(resolve, reject) { ... })` Puts a task at the end of the queue. Returns a Promise.
`Queue.unshiftTask(function(resolve, reject) { ... })` Puts a task at the beginning of the queue. Returns a Promise.

`simple-promise-queue` inherits from [queue](https://github.com/jessetane/queue), so check that out for other methods.

Note: I added an option `autoStart` that can be passed into the constructor so the queue
will automatically start whenever something is pushed into it.

## Examples

Adding your own Promise implementation:
```js
var Queue = require('simple-promise-queue');

Queue.setPromise(require('bluebird'));
```

Pushing a task to the queue and getting a promise:
```js
var Queue = require('simple-promise-queue');

var queue = new Queue({
  autoStart: true, // autostart the queue
});

var promise = queue.pushTask(function(resolve, reject) {
  // do some task here to fetch results
  resolve('results');
});

promise.then(function(results) {
  // process the results here
});
```

A useful example of this would be if you had `Promise.all` but wanted to only throttle
it to run 5 tasks at a time:

```js
var Queue = require('simple-promise-queue');

var queue = new Queue({
  autoStart: true, // autostart the queue
  concurrency: 5
});

var promiseArr = [];

var updateUserInDb = function(id) {
  var promise = queue.pushTask(function(resolve, reject) {
    // do a query to update the user here and
    resolve('done');
  });

  promiseArr.push(promise);
};

var promiseArr = [];
for (var id = 0; id < 100; id++) {
  queue.updateUserInDb(id);
}

Promise.all(promiseArr).then(function() {
  // will call this after all the updates have been run
});

```

Here is an example where you have 2 jobs (each having 2 tasks) to complete and
want to know when each job is finished individually.
```js
var Queue = require('simple-promise-queue');

var queue = new Queue({
  autoStart: true, // autostart the queue
  concurrency: 3
});

var job1Part1 = queue.pushTask(function(resolve, reject) {
  // some limited resource async task that takes 5 seconds
  setTimeout(function() {
    resolve('promise 1 done');
  }, 5000);
});

var job1Part2 = queue.pushTask(function(resolve, reject) {
  // some limited resource async task that takes 3 seconds
  setTimeout(function() {
    resolve('promise 2 done');
  }, 3000);
});

var job2Part1 = queue.pushTask(function(resolve, reject) {
  // some limited resource async task that takes 5 seconds
  setTimeout(function() {
    resolve('promise 1 done');
  }, 5000);
});

var job2Part2 = queue.pushTask(function(resolve, reject) {
  // some limited resource async task that takes 3 seconds
  setTimeout(function() {
    resolve('promise 2 done');
  }, 3000);
});

Promise.all([job1Part1, job1Part2]).then(function(values) {
  // this should take 5 seconds to reach here
});

Promise.all([job2Part1, job2Part2]).then(function(values) {
  // this should take 8 seconds to reach here
});
```

## Testing
1. Run the command inside this folder `./node_modules/mocha/bin/mocha`
