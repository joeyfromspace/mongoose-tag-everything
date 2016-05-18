# Tag Everything
Mongoose plugin that adds a tags path to your models.

## Installation
```
npm install mongoose-tag-everything
```

## Using in your app
```
var mongoose = require('mongoose');
var tagEverything = require('mongoose-tag-everything');

var animal = new mongoose.Schema({
    name: String
});
schema.plugin(tagEverything);

mongoose.model('Animal', animal);
```

The Animal model will now have a tags path that can hold an array of tags.

Tags are their own objects, saved in their own collection in your database (`jfstags` by default). They even have a Mongoose model registered to them (`JFSTag` by default). All of your models that use this plugin will draw from the same pool of tags. Tags are auto-populated on query-time and you can query tags just like any subdoc:
 
 ```
 Animal.find({ "tags.name": ['bright', 'big', 'bulbous']});
 ```
 
 Tags are indexed automatically at their name path and should be super fast.
 
 ## Running tests
 ```
 npm test
 ```
