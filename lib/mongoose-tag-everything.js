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
      ModelName: 'Tag',
      collection: 'tags',
      mongoose: require('mongoose')
    });
    
    mongoose = options.mongoose;

    try {
      mongoose.model(options.ModelName, TagSchema(options));
    } catch(e) {}

    /**
     * @hook
     * Pre-save hook to replace add modelName to appearsIn on existing tags
     */
    schema.pre('save', function(done) {
      var modelName = this.constructor.modelName;
      var tags = this[options.path];
      var Tag = this.constructor.db.model(options.ModelName);
      var normalizedCase;

      if (!this.isNew && !this.isModified(options.path)) {
        return done();
      }

      normalizedCase = _.invokeMap(tags, 'toLowerCase');

      Tag.update({value: {$in: normalizedCase}, appearsIn: { $ne: modelName}}, {$push: {appearsIn: modelName}}, done);
    });

    /**
     * @hook
     * Pre-save hook to create new tags for any that don't exist
     */
    schema.pre('save', function(done) {
      var modelName = this.constructor.modelName;
      var tags = this[options.path];
      var Tag = this.constructor.db.model(options.ModelName);
      var normalizedCase;

      if (!this.isNew && !this.isModified(options.path)) {
        return done();
      }

      normalizedCase = _.invokeMap(tags, 'toLowerCase');

      Tag.find({ value: { $in: tags }}, function(err, existingTags) {
        var values = _.map(existingTags, 'value');
        var missingTags = _.difference(normalizedCase, values);

        async.each(missingTags, function(t, next) {
          Tag.create({
            value: t,
            appearsIn: [modelName]
          }, next);
        }, done);
      });
    });

    /**
     * Add tags path to schema
     */
    _path[options.path] = { type: [mongoose.Schema.Types.String], index: true };
    schema.add(_path);

  };

  return Factory;
}());