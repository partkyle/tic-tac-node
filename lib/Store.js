var Index = (function() {
  function Index(db) {
    this.index = {};
  }

  Index.prototype.get = function(key) {
    return this.index[key];
  }

  Index.prototype.put = function(key, value) {
    return this.index[key] = value;
  }

  Index.prototype.all = function() {
    return this.index;
  }

  Index.prototype.toJSON = function() {
    return this.index;
  }

  return Index;
})();

var Store = (function() {
  function Store() {
    this.db = {};
  }

  Store.prototype.index = function(name) {
    return this.db[name] || (this.db[name] = new Index(name));
  }

  Store.prototype.all = function(name) {
    return this.index(name).all;
  }

  return Store;
})();

exports.Store = new Store();
