const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryController');

//Private func //Takes in object, {a: "", b: "", c: ""}, filters for [a, b], returns {a: "", b: ""}
const filterObj = (obj, ...allowedFields) => {
  const filteredObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) filteredObj[el] = obj[el];
  });
  return filteredObj;
};

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next(); //call getOne() after this middleware.
});

//User functions. (Need to be logged in as a user to use these functions)
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        'This route is not for password update. Please use /updateMyPassword',
        400
      )
    );
    return;
  }
  // 2) Remove unwanted fields such as "role". Include only updatable fields.
  const filteredBody = filterObj(req.body, 'name', 'email');
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'Success.',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

//Route not implemented. Redirect to /signup
exports.addUser = (req, res) => {
  res.redirect(307, '/api/v1/users/signup');
  // res.status(500).json({
  //   status: 'error',
  //   message: 'This route is not defined. Please use /v1/users/signup instead.',
  // });
};

exports.getAllUsers = factory.getAll(User);
exports.getSpecificUser = factory.getOne(User);
//cannot use factory.createOne(User), because already have SignUp which takes care of password and security.
exports.patchSpecificUser = factory.updateOne(User); //don't update passwords with this
exports.deleteSpecificUser = factory.deleteOne(User);
