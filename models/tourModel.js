const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//create schema
//this describes what columns there are, and validate data. State which is primary key, which cannot be null. State type. Set default value.
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Error. Tour requires a name.'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'Error. Tour name must have less than or equal to 40 characters.',
      ],
      minlength: [
        10,
        'Error. Tour name must have more than or equal to 10 characters.',
      ],
      //validate: [validator.isAlpha, 'Tour name must only contain characters.'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'Error. Tour must have duration.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Error. Tour must have max group size.'],
    },
    difficulty: {
      type: String,
      required: [true, 'Error. Tour must have a difficulty.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be: Easy, Medium, Hard',
      },
    },
    rating: {
      type: Number,
      default: 2.5,
      required: [false],
    },
    ratingsAverage: {
      type: Number,
      default: 2.5,
      min: [1, 'Minimum rating is 1.0'],
      max: [5, 'Maximum rating is 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Error. Tour must have a price.'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val <= this.price;
        },
        message: 'Error. Price discount is greater than price.',
      },
    },
    summary: {
      type: String,
      trim: true, //removes whitespace at beginning and end of string.
      required: [true, 'Tour must have a description.'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String, //reference to the image
      required: [true, 'Tour must have a cover image.'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//for derived attributes which we do not store in db.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Document middleware: Runs before .save() command and .create() command
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

//Query middleware, executes before all the methods that start with find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took: ${Date.now() - this.start} ms`);
  console.log(docs);
  next();
});

//Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //Add match to the pipeline obj
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema, 'tours'); //create tour model. Model is a constructor compiled from a schema definition.

module.exports = Tour;