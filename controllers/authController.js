const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
  return token;
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRATION_TIME * 24 * 60 * 60 * 1000
    ),
    // secure: true, //make sure cookie is sent on HTTPS
    httpOnly: true, //make sure cookie is not modified by browser
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output. Can do this because .create() called in signup()
  user.password = undefined;

  res.status(statusCode).json({
    status: 'Success.',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  //log the user into the application right after they sign up
  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
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

exports.restrictTo = (...roles) => {
  const wrappedFunc = (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError('Access denied.', 403));
      return;
    }
    next();
  };
  return wrappedFunc;
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError('Email not found. Try again.', 404));
    return;
  }
  // 2. Generate the random reset token
  //this also sets the passwordResetToken and the passwordResetExpires properties of user.
  const resetToken = user.createPasswordResetToken(); //unencrypted version
  await user.save({ validateBeforeSave: false }); //have to set to false, so mongoose won't check for email required, or other validators.

  // 3. Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a request with your new password and password confirm to: ${resetURL}\nIf you didn't forget your password, please login.`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset token.',
      message: message,
    });
    res.status(200).json({
      status: 'Sucess.',
      message: 'Token sent to mail.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  // 2. Check token expiry. Check user exists. Then set new password (or throw err)
  if (!user) {
    next(new AppError('Token in invalid or has expired.', 400));
    return;
  }
  user.password = req.body.password; //will run the pre save middlware to encrypt pass.
  user.passwordConfirm = req.body.passwordConfirm;

  // 3. Update passwordChangedAt property
  //   user.passwordChangedAt = Date.now();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4. Log the user in. (send JWT)
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //Patch req.body -> { passwordCurrent: "", password: "", passwordConfirm: ""}

  // 1. Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if posted password is correct
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
    next(new AppError('Your current password is invalid.', 401));
    return;
  }

  // 2.5 (out of course syllabus) Check if new password != old password
  if (req.body.passwordCurrent === req.body.password) {
    next(
      new AppError(
        'New password has been used before. Choose a different password.'
      )
    );
    return;
  }

  // 3. Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. Log the user in with the new password
  createSendToken(user, 200, res);
});
