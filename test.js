var assert = require('assert');

var Store  = require('./lib/Store.js').Store;

var myStore = new Store();

var testIndex = myStore.index('test');
testIndex.set('a', 1);
assert.ok(testIndex.get('a') == 2);

