const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const verifyToken = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authorization token missing');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub);

    if (!user) {
      throw new ApiError(401, 'User for this token no longer exists');
    }

    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      is_admin: user.is_admin
    };

    return next();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(401, 'Invalid or expired token');
  }
});

const requireAdmin = (req, _res, next) => {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const isAdminByEmail = adminEmails.includes((req.user?.email || '').toLowerCase());

  if (!req.user?.is_admin && !isAdminByEmail) {
    return next(new ApiError(403, 'Admin access required'));
  }

  return next();
};

module.exports = { verifyToken, requireAdmin };