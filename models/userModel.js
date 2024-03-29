const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
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
      message: 'Error. Passwords do not match.',
    },
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  passwordChangedAt: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
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

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    next();
    return;
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //this points to current query object
  this.find({ active: { $ne: false } });
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

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log(
  //   'Plaintext: ',
  //   resetToken,
  //   '\nEncrypted: ',
  //   this.passwordResetToken
  // );
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
