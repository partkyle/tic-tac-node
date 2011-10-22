var Store = require('../lib/Store.js').Store, should = require('should');

describe('testing the store module', function() {
  var index = Store.index('test');
  it('should return a new index when one does not exist', function() {
    index.should.be.defined;
  });

  it('should return the same value that is stored in it', function() {
    index.put('a', 1);
    index.get('a').should.be.equal(1);
  });
});
