const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

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
          return val <= this.price;
        },
        message: 'Error. Price discount is greater than price.',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a description.'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
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

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  // this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log(`Query took: ${Date.now() - this.start} ms`);
  // console.log(docs);
  next();
});

//Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema, 'tours');

module.exports = Tour;