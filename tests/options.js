var assert = require('chai').assert;
var mongoose = require('mongoose');
var tagEverything = require('../index');
var _ = require('lodash');

var testDb = 'mongodb://127.0.0.1:27017/test';

describe('mongoose-tag-everything options tests', function() {
  before(function(done) {
    var connection = mongoose.connect(testDb);
    var called = false;
    connection.connection.on('connected', function() {
      if (called === false) {
        connection.connection.db.dropDatabase(done);
        called = true;
      }
      connection.plugin(tagEverything, {
        collection: 'cooltags',
        ModelName: 'Tagegeddon',
        path: 'clips'
      });
    });
  });

  after(function(done) {
    mongoose.connection.close(done);
  });

  it('should allow the collection name to be changed by settings options.collection', function(done) {
    var Model;
    var schema = new mongoose.Schema({
      name: String
    });
    mongoose.model('TestAgain', schema);

    Model = mongoose.model('TestAgain');
    Model.create({ name: 'Vindaloo', clips: ['hot', 'acidic'] }, function(err) {
      mongoose.connection.db.listCollections().toArray(function(err, names) {
        var tagsCollection = _.find(names, { name: 'cooltags' }).name;
        assert.equal(tagsCollection, 'cooltags');
        done();
      });
    });
  });

  it('should allow the mongoose modelname to be renamed by settings options.ModelName', function(done) {
    var Model;
    var schema = new mongoose.Schema({
      name: String
    });
    mongoose.model('AnotherTest', schema);

    Model = mongoose.model('AnotherTest');
    Model.create({ name: 'Pizza', clips: ['delicious', 'fattening',  'diabetus']}, function() {
      var Tag = mongoose.model('Tagegeddon');
      Tag.find({}).exec(function(err, tags) {
        // Should equal five including the tags from the previous test
        assert.equal(tags.length, 5);
        done();
      });
    });
  });

  it('should allow the schema path for tags to be changed by setting options.path', function(done) {
    var Model;
    var schema = new mongoose.Schema({
      name: String
    });
    mongoose.model('RadTest', schema);

    Model = mongoose.model('RadTest');
    Model.create({ name: 'Donut', clips: ['sugary', 'powdery']}, function() {
      Model.find({ 'clips.name': 'sugary' }).exec(function(err, docs) {
        assert.equal(docs.length, 1);
        done();
      });
    });
  });
});