var assert = require('chai').assert;
var mongoose = require('mongoose');
var tagEverything = require('../index');
var _ = require('lodash');

var testDb = 'mongodb://127.0.0.1:27017/test';

describe('mongoose-tag-everything', function() {
  before(function(done) {
    var connection = mongoose.connect(testDb);
    mongoose.connection.on('connected', function(err) {
      if (err) {
        throw new Error(err);
      }

      connection.connection.db.dropDatabase(done);
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
    var schema = new mongoose.Schema({
      name: String
    });
    schema.plugin(tagEverything);
    Model = mongoose.model('Test', schema);

    Model.create({ name: 'Lorem Ipsum', tags: ['cool', 'rad'] }, function(err, doc) {
      assert.deepEqual(_.map(doc.tags, 'name'), ['cool', 'rad']);
      done();
    });
  });

  it('should auto-populate tags on query', function(done) {
    var Model = mongoose.model('Test')

    Model.findOne({}).exec(function(err, model) {
      assert.deepEqual(_.map(model.tags, 'name'), ['cool', 'rad']);
      done();
    });
  });

  it('should create only one tag per tag name', function(done) {
    var Model = mongoose.model('Test');
    Model.findOne({}).exec(function(err, firstDoc) {
      Model.create({ name: 'Wow this is cool', tags: ['rad', 'awesome'] }, function(err, newDoc) {
        var firstRadId = _.find(firstDoc.tags, { name: 'rad'})._id;
        var secondRadId = _.find(newDoc.tags, { name: 'rad'})._id;
        assert(firstRadId.equals(secondRadId));
        done();
      });
    });
  });

  it('should return all tags when querying by name', function(done) {
    var Tag = mongoose.model('JFSTag');
    Tag.find({}).exec(function(err, results) {
      assert.equal(results.length, 3);
      done();
    });
  });

  it('should only return documents with the tag rad', function(done) {
    var Model = mongoose.model('Test');
    Model.find({ 'tags.name': 'rad' }).exec(function(err, results) {
      assert.equal(results.length, 2);
      done();
    });
  });

  it('should only return documents with the tag cool', function(done) {
    var Model = mongoose.model('Test');
    Model.find({ 'tags.name': 'cool' }).exec(function(err, results) {
      assert.equal(results.length, 1);
      done();
    });
  });
});