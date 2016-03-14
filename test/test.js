require('./chai');

var Queue = require('../index.js');

describe('Promise Queue', function() {
  this.timeout(1000);

  describe('#init:autoStart', function() {
    var queue;

    it('should autostart when when passing autoStart:true', function(done) {
      var queueRan = false;

      queue = new Queue({
        autoStart: true
      });

      queue.on('end', function() {
        expect(queueRan).equal(true);
        done();
      });

      queue.push(function(cb) {
        queueRan = true;
        cb();
      });
    });

    it('should autostart when adding and unshifting tasks', function(done) {
      queue = new Queue({
        autoStart: true
      });

      queue.pushTask(function(resolve) {
        resolve();
      });

      queue.unshiftTask(function() {
        done();
      });
    });

    it('should autostart after queue has ended', function(done) {
      var queueRan = false;

      queue = new Queue({
        autoStart: true
      });

      queue.push(function(cb) {
        cb();
      });

      setTimeout(function() {
        queue.on('end', function() {
          expect(queueRan).equal(true);
          done();
        });

        queue.push(function(cb) {
          queueRan = true;
          cb();
        });
      }, 30);
    });

    it('should not autostart when passing autoStart:false', function(done) {
      queue = new Queue({
        autoStart: false
      });

      queue.on('end', function() {
        done('queue autostarted when not supposed to');
      });

      queue.push(function(cb) {
        cb();
      });

      setTimeout(function() {
        done();
      }, 30);
    });

    afterEach(function() {
      if (queue.running === true) {
        queue.end();
      }
    });
  });

  describe('setPromise', function() {
    var queue;
    var oldPromise = Promise;

    afterEach(function() {
      Queue.setPromise(oldPromise);
    });

    it('should be able to set a custom promise', function(done) {
      Queue.setPromise(require('bluebird'));
      queue = new Queue({
        autoStart: true
      });

      queue.pushTask(function(resolve) {
        resolve(true);
      }).finally(function() {
        done();
      });
    });
  });

  describe('#methods', function() {
    var queue;

    beforeEach(function() {
      queue = new Queue({
        concurrency: 1
      });
    });

    describe('returnValue', function() {
      it('should be able to chain a .then()', function(done) {
        var promise = queue.pushTask(function(resolve) {
          setTimeout(resolve, 10);
        });

        promise.then(done);

        queue.start();
      });

      it('should be able to chain a .then() rejection', function(done) {
        var promise = queue.pushTask(function(resolve, reject) {
          setTimeout(reject, 10);
        });

        promise.then(function() {}, done);

        queue.start();
      });

      it('should be able to chain a .catch()', function(done) {
        var promise = queue.pushTask(function(resolve, reject) {
          setTimeout(function() {
            reject('badValue');
          }, 10);
        });

        promise.catch(function(reason) {
          expect(reason).equal('badValue');
          done();
        });

        queue.start();
      });

      it('should be able to use a Promise.all', function(done) {
        var state = 'none';
        var promise1 = queue.pushTask(function(resolve) {
          expect(state).equal('none');
          setTimeout(function() {
            state = 'first';
            resolve('1');
          }, 10);
        });

        var promise2 = queue.pushTask(function(resolve) {
          expect(state).equal('first');
          setTimeout(function() {
            state = 'second';
            resolve('2');
          }, 10);
        });

        var promise3 = queue.pushTask(function(resolve) {
          expect(state).equal('second');
          setTimeout(function() {
            state = 'third';
            resolve('3');
          }, 10);
        });

        Promise.all([promise1, promise2, promise3]).then(function(results) {
          expect(state).equal('third');
          expect(results[0]).equal('1');
          expect(results[1]).equal('2');
          expect(results[2]).equal('3');
          done();
        });

        queue.start();
      });
    });

    describe('pushTask', function() {
      it('should run a pushed promise', function(done) {
        queue.pushTask(function(resolve) {
          setTimeout(resolve, 10);
        }).then(done);

        queue.start();
      });

      it('should run 2 pushed promises one after the other', function(done) {
        var state = 'none';
        queue.pushTask(function(resolve) {
          expect(state).equal('none');
          state = 'first';
          setTimeout(resolve, 10);
        });

        queue.pushTask(function(resolve) {
          expect(state).equal('first');
          state = 'second';
          setTimeout(resolve, 10);
        });

        queue.on('end', function() {
          expect(state).equal('second');
          done();
        });

        queue.start();
      });
    }); // end pushTask

    describe('unshiftTask', function() {
      it('should run a promise when adding to front', function(done) {
        queue.unshiftTask(function(resolve) {
          setTimeout(resolve, 10);
        }).then(done);

        queue.start();
      });

      it('should run an unshifted task first', function(done) {
        var state = 'none';
        queue.pushTask(function(resolve) {
          expect(state).equal('first');
          state = 'second';
          setTimeout(resolve, 10);
        });

        queue.unshiftTask(function(resolve) {
          expect(state).equal('none');
          state = 'first';
          setTimeout(resolve, 10);
        });

        queue.on('end', function() {
          expect(state).equal('second');
          done();
        });

        queue.start();
      });
    }); // end unshiftTask

    afterEach(function() {
      if (queue.running === true) {
        queue.end();
      }
    });
  }); // end describe('#methods')
}); // end test
