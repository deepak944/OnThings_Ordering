const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/token');

const toSafeUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  name: user.full_name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  created_at: user.created_at
});

const signup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const fullName = req.body.full_name || req.body.name;
  const email = String(req.body.email).toLowerCase().trim();
  const password = req.body.password;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered. Please login.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    full_name: fullName,
    email,
    password: hashedPassword,
    phone: req.body.phone || null,
    address: req.body.address || null
  });

  const token = generateToken(user);

  return res.status(201).json({
    success: true,
    message: 'Signup successful',
    data: {
      user: toSafeUser(user),
      token
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const email = String(req.body.email).toLowerCase().trim();
  const password = req.body.password;

  const user = await User.findOne({ where: { email } });
  if (!user || !user.password) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: toSafeUser(user),
      token
    }
  });
});

const profile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json({
    success: true,
    data: toSafeUser(user)
  });
});

module.exports = {
  signup,
  login,
  profile
};