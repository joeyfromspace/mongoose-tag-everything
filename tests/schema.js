var assert = require('chai').assert;
var mongoose = require('mongoose');
var tagEverything = require('../index');
var _ = require('lodash');

var testDb = 'mongodb://127.0.0.1:27017/test';
var connection;

describe('mongoose-tag-everything', function() {
  before(function(done) {
    connection = mongoose.connect(testDb);
    mongoose.connection.on('connected', function(err) {
      if (err) {
        throw new Error(err);
      }

      connection.connection.db.dropDatabase(done);
      connection.plugin(tagEverything);
    });
  });


  after(function(done) {
    mongoose.connection.close(done);
  });

  it('should add a tags path to the schema', function() {
    var schema = new mongoose.Schema({
      name: String
    });
    schema.plugin(tagEverything);
    assert.property(schema.paths, 'tags');
  });

  it('should save tags to the tags path in a model', function(done) {
    var Model;
    var schema = new connection.Schema({
      name: String
    });
    schema.plugin(tagEverything);
    Model = connection.model('Test', schema);
    Model.create({ name: 'Lorem Ipsum', tags: ['cool', 'rad'] }, function(err, doc) {
      assert.deepEqual(doc.tags, ['cool', 'rad']);
      done();
    });
  });

  it('should create only one tag per tag value', function(done) {
    var Model = connection.model('Test');
    var Tag = connection.model('Tag');
    var testTags = ['rad', 'awesome'];

    Model.create({ name: 'Wow this is cool', tags: testTags }, function() {
      Tag.find({}, function(err, tags) {
        assert.equal(tags.length, 3);
        done();
      });
    });
  });

  it('should return all tags when querying by value', function(done) {
    var Tag = connection.model('Tag');
    Tag.find({}).exec(function(err, results) {
      assert.equal(results.length, 3);
      done();
    });
  });

});