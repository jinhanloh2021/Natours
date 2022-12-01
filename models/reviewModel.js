const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Error. Review cannot be empty.'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Error. Review must reference a Tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      requried: [true, 'Error. Review must be authored by a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//MIDDLEWARE
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: ['name'],
  // })
  this.populate({
    path: 'user',
    select: ['name', 'email'],
  }).select('-__v -createdAt');
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 2.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review //this.constructor points to the Review model
  this.constructor.calcAverageRatings(this.tour);
});

//findByIdAndDelete findByIdAndUpdate
reviewSchema.post(/^findOneAnd/, async (doc) => {
  await doc.constructor.calcAverageRatings(doc.tour);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
