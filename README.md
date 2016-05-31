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

## Troubleshooting

### Force Mongoose Instance
If you run into problems with models freezing on pre-validation, the tags model may be using a different Mongoose instance than the one your model is defined in. This can happen if you are using Mongoose behind a closure and not in the global namespace. To get around this, supply your mongoose instance in the options. In this use case it is recommended to use the plugin as a global plugin that applies to all schemas.

Example:

```
var mongoose = require('mongoose');
var tagEverything = require('mongoose-tag-everything');

mongoose.plugin(tagEverything, {
    mongoose: mongoose
});

var animal = new mongoose.Schema({
    name: String
});

mongoose.model('Animal', animal);

mongoose.model('Animal').create({ name: 'Zebra', tags: ['striped'] });
```

### Custom path, collection, and model names
Pass the `path`, `collection`, or `ModelName` options to customize the respective names. It is recommended to load the plugin globally if any custom values are being used so there is consistency across models.

## Running tests
```
npm test
```
