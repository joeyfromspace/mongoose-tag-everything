var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var TagSchema = require('./Tag');

module.exports = (function() {

  var Factory = function(schema, options) {
    if (!options) {
      options = {};
    }

    _.defaults(options, {
      path: 'tags',
      ModelName: 'JFSTag',
      collection: 'jfstags'
    });

    if (mongoose.modelNames().indexOf(options.ModelName) === -1) {
      mongoose.model(options.ModelName, TagSchema(options));
    }

    function _autoPopulate(done) {
      var tagQuery = this._conditions[options.path];
      var Tag = mongoose.model(options.ModelName);
      var query = this;
      var q = {};
      query.populate(options.path);

      if (!tagQuery) {
        return done();
      }

      //Tag.find({ name: tagQuery }).exec(function(err, tags) {
      //  q = _.head(_.map(tags, '_id'));
      //  query.where(options.path, q);
      //  done();
      //});

      done();
    }

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
    schema.pre('save', function(done) {
      var model = this;
      var tags = model[options.path];
      var Tag = mongoose.model(options.ModelName);

      async.map(tags, function(tag, next) {
        if (typeof tag !== 'string') {
          return next(null, tag);
        }

        Tag.findOne({ name: tag }).exec(function(err, tagModel) {
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
    schema.add((function(fields) {
      // Unfortunately must use mixed type to get around Mongoose throwing an error before translating strings with objects
      fields[options.path] = { type: [mongoose.Schema.Types.Mixed], ref: options.ModelName, index: true };
      return fields;
    })({}));

  };

  return Factory;
}());