var assert = require('chai').assert;
var mongoose = require('mongoose');
var tagEverything = require('../index');
var _ = require('lodash');

var testDb = 'mongodb://127.0.0.1:27017/tag-everything-test';
var connection;

describe('mongoose-tag-everything options tests', function() {
  before(function(done) {
    connection = mongoose.connect(testDb);
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
    connection.model('TestAgain', schema);

    Model = connection.model('TestAgain');
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
    connection.model('AnotherTest', schema);

    Model = connection.model('AnotherTest');
    Model.create({ name: 'Pizza', clips: ['delicious', 'fattening',  'diabetus']}, function() {
      connection.model('Tagegeddon').find({}, function(err, tags) {
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
    connection.model('RadTest', schema);

    Model = connection.model('RadTest');
    Model.create({ name: 'Donut', clips: ['sugary', 'powdery']}, function() {
      Model.find({ 'clips': 'sugary' }).exec(function(err, docs) {
        assert.equal(docs.length, 1);
        done();
      });
    });
  });
});