var chai = require('chai');

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

chai.Assertion.addProperty(chai.Assertion.prototype, 'now', function() {
  this.assert(
      this._obj > new Date().getTime() - 60000 && this._obj < new Date().getTime()
    , 'expected #{this} to be recent'
    , 'expected #{this} to not be recent'
  );
});
