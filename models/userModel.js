const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Error. User requires a name.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Error. User requires an email.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Error. Email is invalid.'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Error. User requires a password.'],
    minlength: 8,
    select: false, //important so that password not displayed on find() by default.
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      /**This only works on save() or create(), not on findOneAndUpdate().**/
      validator: function (el) {
        return el === this.password; //checks if password === passwordConfirm
      },
      message: 'Passwords do not match.',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
});

//Middlware function: Encryption of password occurs right before save()
userSchema.pre('save', async function (next) {
  //Ensure that if password modified, then we hash it before saving.
  if (!this.isModified('password')) {
    next();
    return;
  }
  this.password = await bcrypt.hash(this.password, 12); //the 12 is how much cpu power we use to encrypt the password
  this.passwordConfirm = undefined; //Ensures the duplicate is not stored.
  next();
});

//checks if input password and hashedpassword match
userSchema.methods.checkPassword = async function (
  candidatePassword,
  hashedPassword
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

//Checks whether password is changed AFTER the JWT is issued. Prevents access if true.
userSchema.methods.passwordChanged = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); //converts to seconds
    //time JWT issued < time password changed
    return JWTTimeStamp < changedTimeStamp; //if password is changed after token issued, then it is an error. Should not allow access.
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
