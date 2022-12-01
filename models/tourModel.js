const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
const User = require('./userModel');

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
      min: [1, '{VALUE} is lower than the minimum rating 1.0'],
      max: [5, '{VALUE} is higher than the maximum rating is 5.0'],
      set: (val) => Math.round(val * 10) / 10, //runs everytime value is set.
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
    startLocation: {
      //GeoJSON to specify geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //[longitude, latitude]
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // guides: Array //for Embedding user inside tourModel
  },
  {
    toJSON: { virtuals: true }, // Make Mongoose attach virtuals whenever calling `JSON.stringify()`. Will add virtual { durationWeeks: 4 } to output.
    toObject: { virtuals: true }, //Attach virtuals when toObject called.
  }
);

// tourSchema.index({ price: 1 }); //build an index on price, in asc order. Note that price is not a candidate key.
tourSchema.index({ price: 1, ratingsAverage: -1 }); //build index on price asc, then on ratings dsc
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema //creates virtual field. Defines getter and setter of virtual field.
  .virtual('durationWeeks')
  .get(function () {
    return this.duration / 7;
  })
  .set(function (durationInWeeks) {
    this.duration = durationInWeeks * 7;
  });

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //The local '_id' is stored in the foreign 'reviewMode.tour'
  localField: '_id',
});

//Tour Schema MIDDLEWARE functions
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Embedding middleware. To embed guides inside our Tour when we create new docs.
tourSchema.pre('save', async function (next) {
  //for each id in this.guides, find User promise. Then with the array of promises, await all.
  const guidesPromises = this.guides.map(async (id) => User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});

//Ensure that secretTours are not found
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  // this.where('secretTour').$ne(true); //mongoose method
  next();
});

//Ensure that guide references are populated.
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

//Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  // Hide secret tours if geoNear is NOT used
  if (!(this.pipeline().length > 0 && '$geoNear' in this.pipeline()[0])) {
    this.pipeline().unshift({
      $match: { secretTour: { $ne: true } },
    });
  }
  next();
});

//mongoose.model() uses default mongoose connection. If have custom connection, should use customConnection.connect().
const Tour = mongoose.model('Tour', tourSchema, 'tours');

module.exports = Tour;
