const Tour = require('../models/tourModel');
const tourModel = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.getAllTours = async (req, res) => {
  // /api/v1/tours?difficulty=easy&duration=5
  // req.query -> { difficulty: 'easy', duration: '5' }
  // console.log(req.query);
  try {
    // const queryObj = { ...req.query }; //shallow copy
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => {
    //   delete queryObj[el];
    // });

    //Filtering
    // const { page, sort, limit, fields, ...queryObj } = req.query; //exclude fields from queryObj
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // let query = Tour.find(JSON.parse(queryStr)); //Tour is a collection. Tour.find() returns entire collection as an array. Can add filter object to method.

    //Sorting
    // if (typeof sort !== 'undefined') {
    //   const sortBy = sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }

    //Field limiting. Select which field of tour is sent.
    // if (typeof fields !== 'undefined') {
    //   const fieldsString = fields.split(',').join(' ');
    //   query = query.select(fieldsString);
    // } else {
    //   query = query.select('-__v'); //excludes __v field.
    // }

    //Pagination
    // const pageNumber = page * 1 || 1;
    // const limitNumber = limit * 1 || 100;
    // const skip = (pageNumber - 1) * limitNumber;

    // //page=2&limit=10   page1: 1-10, page2: 11-20; So we skip(10) if we are on page 2.
    // query = query.skip(skip).limit(limitNumber);

    // if (typeof page !== 'undefined') {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist.');
    // }

    //Execute Query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    res.status(200).json({
      status: 'success',
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail.',
      message: err,
    });
  }
};

//middleware func
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getSpecificTour = async (req, res) => {
  try {
    // Tour.findOne({ _id: req.params.id });
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail.',
      message: err,
    });
  }
};

exports.addTour = async (req, res) => {
  //Creates new document, then call .save() on the document to add to collection.
  // const newTour = new Tour({});
  // newTour.save()
  try {
    //Directly creates new document in collection
    const newTour = await tourModel.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail.',
      message: err,
    });
  }
};

exports.patchSpecificTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail.',
      message: err,
    });
  }
};

exports.deleteSpecificTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail.',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          // _id: '$ratingsAverage',
          _id: { $toUpper: '$difficulty' }, //group by difficulty
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: 1, //1 for asc, -1 for desc
        },
      },
      // {
      //   $match: {
      //     _id: { $ne: 'EASY' },
      //   },
      // },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail.',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { month: 1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail.',
      message: err,
    });
  }
};
