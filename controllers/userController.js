const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'Success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.addUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet implemented.',
  });
};

exports.getSpecificUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet implemented.',
  });
};

exports.patchSpecificUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet implemented.',
  });
};

exports.deleteSpecificUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet implemented.',
  });
};
