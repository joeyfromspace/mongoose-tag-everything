var _ = require('lodash');
var async = require('async');
var TagSchema = require('./Tag');

module.exports = (function() {

  var Factory = function(schema, options) {
    var _path = {},mongoose;
    if (!options) {
      options = {};
    }

    _.defaults(options, {
      path: 'tags',
      ModelName: 'JFSTag',
      collection: 'jfstags',
      mongoose: require('mongoose')
    });
    
    mongoose = options.mongoose;

    try {
      mongoose.model(options.ModelName, TagSchema(options));
    } catch(e) {}

    var _autoPopulate = function(done) {
      this.populate(options.path);
      done();
    };

    /**
     * @hook
     * Pre-query middleware to autopopulate tags
     */
    schema.pre('find', _autoPopulate);
    schema.pre('findOne', _autoPopulate);

    /**
     * @hook
     * Pre-save hook to replace tag strings with objects, creating new objects as necessary
     */
    schema.pre('validate', function(done) {
      var model = this;
      var tags = model[options.path];
      var Tag = mongoose.model(options.ModelName);
      

      async.map(tags, function(tag, next) {
        if (typeof tag !== 'string') {
          return next(null, tag);
        }

        Tag.findOne({ name: tag }, function(err, tagModel) {
          if (tagModel) {
            return next(err, tagModel);
          }

          Tag.create({ name: tag }, function(err, tagModel) {
            return next(err, tagModel);
          });
        });
      }, function(err, results) {
        model[options.path] = results;
        done();
      });
    });

    /**
     * Add tags path to schema
     */
    _path[options.path] = { type: [mongoose.Schema.Types.Mixed], ref: options.ModelName, index: true };
    schema.add(_path);

  };

  return Factory;
}());