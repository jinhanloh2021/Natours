const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .limitFields()
      .sort()
      .paginate();
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs,
      },
    });
  });

//Model: Tour, User, Review
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      next(new AppError('Invalid ID.', 404));
      return;
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }); //implicit return

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      next(new AppError('Invalid ID.', 404));
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOption) query = query.populate(populateOption);
    const doc = await query; //execute the query

    if (!doc) {
      next(new AppError('Invalid ID.', 404));
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
