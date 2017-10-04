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

    // Wrap in a try/catch block in case we're registering a model that is already registered
    try {
      mongoose.model(options.ModelName, TagSchema(options));
    } catch(e) {}

    /**
     * @hook
     * Pre-save hook to replace add modelName to appearsIn on existing tags
     */
    schema.pre('save', function(done) {
      // TODO Add support for sub docs through the ownerDocument property
      var isSubDocument = Boolean(!this.constructor.db);
      var modelName = this.constructor.modelName;
      var tags = this[options.path];
      var Tag, normalizedCase;

      if (isSubDocument || !this.isNew || !this.isModified(options.path) || !tags.length) {
        return done();
      }

      Tag = this.constructor.db.model(options.ModelName);
      normalizedCase = _.invokeMap(tags, 'toLowerCase');

      Tag.update({value: {$in: normalizedCase}, appearsIn: { $ne: modelName}}, {$push: {appearsIn: modelName}}, done);
    });

    /**
     * @hook
     * Pre-save hook to create new tags for any that don't exist
     */
    schema.pre('save', function(done) {
      var isSubDocument = Boolean(!this.constructor.db);
      var modelName = this.constructor.modelName;
      var tags = this[options.path];
      var Tag, normalizedCase;

      if (isSubDocument || !this.isNew || !this.isModified(options.path) || !tags.length) {
        return done();
      }

      Tag = this.constructor.db.model(options.ModelName);
      normalizedCase = _.invokeMap(tags, 'toLowerCase');

      Tag.find({ value: { $in: normalizedCase }}, function(err, existingTags) {
        var values = _.map(existingTags, 'value');
        var missingTags = _.difference(normalizedCase, values);
        
        if (!missingTags.length) {
          return done();  
        }
        
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
