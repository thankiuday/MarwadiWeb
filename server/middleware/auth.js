import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import ApiError from '../utils/ApiError.js';

export const protect = async (req, _res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.accountType === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (!admin) throw new ApiError(401, 'Admin not found');
      req.user = admin;
      req.accountType = 'admin';
    } else {
      const user = await User.findById(decoded.id);
      if (!user) throw new ApiError(401, 'User not found');
      req.user = user;
      req.accountType = 'customer';
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token'));
    }
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Not authorized for this action'));
    }
    next();
  };
};
