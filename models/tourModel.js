const mongoose = require('mongoose');
//create schema
//this describes what columns there are, and validate data. State which is primary key, which cannot be null. State type. Set default value.
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Error. Tour requires a name.'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 2.5,
    required: [false],
  },
  price: {
    type: Number,
    required: [true, 'Error. Tour must have a price.'],
  },
});

const Tour = mongoose.model('Tour', tourSchema, 'tours'); //create tour model. Model is a constructor compiled from a schema definition.

module.exports = Tour;