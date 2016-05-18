var mongoose = require('mongoose');
var _ = require('lodash');

module.exports = (function() {

  var JFSTagFactory = function(options) {
    if (!options) {
      options = {};
    }
    _.defaults(options, {
      path: 'tags',
      collection: 'jfstags',
      ModelName: 'JFSTag'
    });

    var TagSchema = new mongoose.Schema({
      name: {type: String, index: true }
    }, {collection: options.collection});

    return TagSchema;
  };

  return JFSTagFactory;
}());