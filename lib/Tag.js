var mongoose = require('mongoose');
var _ = require('lodash');

module.exports = (function() {

  var JFSTagFactory = function(options) {

    var TagSchema = new mongoose.Schema({
      value: {type: String, index: true, unique: true, required: true },
      // The models in which this tag appears
      appearsIn: { type: [String] }
    }, { timestamps: true, collection: options.collection });

    /**
     * @hook
     * Turn tags to lowercase before saving
     */
    TagSchema.pre('save', function(next) {
      if (this.isNew || this.isModified('value')) {
        this.value = this.value.toLowerCase();
      }

      next();
    });

    return TagSchema;
  };

  return JFSTagFactory;
}());