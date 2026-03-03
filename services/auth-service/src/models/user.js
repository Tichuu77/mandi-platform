const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {ROLES} = require('mandi-shared/constants/enums');
const crypto = require('crypto');
const { match } = require('assert');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [50, 'Name must be less than 50 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password in queries by default
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      match: [/^[0-9]{10}$/, 'Phone must be 10 digits'],
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'admin',
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null, // null for super admin
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'pending', // Pending approval from super admin
    },
    isDeleted:{
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    // For tenant owners (admins)
    mandiName: {
      type: String,
      minlength: [3, 'Mandi name must be at least 3 characters'],
      maxlength: [50, 'Mandi name must be less than 50 characters'],
      default: null,
    },
    gstNumber: {
      type: String,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please provide a valid GST number'],
      default: null,
    },
    address: {
      street: {
        type: String,
        maxlength: [50, 'Street must be less than 50 characters'],
      },
      city: {
        type: String,
        minlength: [2, 'City must be at least 2 characters'],
        maxlength: [50, 'City must be less than 50 characters'],
      },
      state: {
        type: String,
        minlength: [2, 'State must be at least 2 characters'],
        maxlength: [50, 'State must be less than 50 characters'],
      },
      pincode: {
        type: String,
        match: [/^[0-9]{6}$/, 'Pincode must be 6 digits'],

      },
    },
    passwordResetToken: {
        type: String,
        select: false, // Don't return reset token in queries by default
    },
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
 
userSchema.methods.isPasswordResetTokenExpired = function () {
  if (!this.passwordResetExpires) {
    return true;
  }
  return Date.now() > this.passwordResetExpires;
};

 
userSchema.methods.getPasswordResetToken = function () {
  return this.passwordResetToken;
};

 

userSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});


// Method to generate auth response (without sensitive data)
userSchema.methods.toAuthJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    tenantId: this.tenantId?.toString(),
    status: this.status,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;