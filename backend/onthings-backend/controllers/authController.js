const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/token');
const { sendEmail } = require('../utils/email');

const toSafeUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  name: user.full_name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  created_at: user.created_at
});

const createPasswordResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  return {
    rawToken,
    hashedToken,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30)
  };
};

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

const forgotPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const email = String(req.body.email || '').toLowerCase().trim();
  const user = await User.findOne({ where: { email } });

  if (!user || !user.password) {
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been prepared.'
    });
  }

  const { rawToken, hashedToken, expiresAt } = createPasswordResetToken();
  user.reset_password_token = hashedToken;
  user.reset_password_expires_at = expiresAt;
  await user.save();

  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
  const isEmailConfigured =
    Boolean(process.env.SMTP_HOST) && Boolean(process.env.SMTP_USER) && Boolean(process.env.SMTP_PASS);
  let emailSent = false;

  if (isEmailConfigured) {
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your OnThings password',
        html: `
          <p>Hello ${user.full_name},</p>
          <p>We received a request to reset your password.</p>
          <p>
            <a href="${resetUrl}">Click here to reset your password</a>
          </p>
          <p>This link will expire in 30 minutes.</p>
        `
      });
      emailSent = true;
    } catch (error) {
      console.warn(`Failed to send password reset email: ${error.message}`);
    }
  }

  const response = {
    success: true,
    message: emailSent
      ? 'Password reset link sent to your email.'
      : 'Password reset token generated for local testing.'
  };

  if (!isEmailConfigured || process.env.NODE_ENV !== 'production') {
    response.data = {
      reset_token: rawToken,
      reset_url: resetUrl,
      expires_at: expiresAt.toISOString()
    };
  }

  return res.status(200).json(response);
});

const resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const token = String(req.body.token || '').trim();
  const password = String(req.body.password || '');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    where: {
      reset_password_token: hashedToken,
      reset_password_expires_at: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!user) {
    throw new ApiError(400, 'Reset token is invalid or has expired');
  }

  user.password = await bcrypt.hash(password, 12);
  user.reset_password_token = null;
  user.reset_password_expires_at = null;
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Password reset successful. You can now log in with your new password.'
  });
});

module.exports = {
  signup,
  login,
  profile,
  forgotPassword,
  resetPassword
};
