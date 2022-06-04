const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
  return token;
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  //log the user into the application right after they sign up
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'Success.',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //To login we need to check
  //1. Email and password exists
  if (!email || !password) {
    next(new AppError('Error. Please input an email and password.', 400));
    return;
  }

  //2. Check if user exist && password matches
  const user = await User.findOne({ email: email }).select('+password'); //if user === undefined, then email doesn't exist. Won't bother checking password because of if short circuit.
  if (!user || !(await user.checkPassword(password, user.password))) {
    next(new AppError('Incorrect email or password.', 401));
    return;
  }

  //3. Send JWT back to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'Success.',
    token: token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get token from user and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    next(new AppError('You are not logged in.', 401));
    return;
  }
  // 2. Validate JWT token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user corresponding to JWT still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    next(new AppError('User no longer exist. Please login again.', 401));
    return;
  }

  // 4. Check if user changed password after JWT was issued
  if (currentUser.passwordChanged(decoded.iat)) {
    next(new AppError('Password changed. Please login again.', 401));
    return;
  }
  // 5. Allow access to next() protected route.
  req.user = currentUser;
  next();
});
