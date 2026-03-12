import User from '../models/User.js';
import Admin from '../models/Admin.js';
import ApiError from '../utils/ApiError.js';
import generateToken from '../utils/generateToken.js';

export const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name?.trim()) throw new ApiError(400, 'Please enter your name');
    if (!email?.trim()) throw new ApiError(400, 'Please enter your email');
    if (!password) throw new ApiError(400, 'Please enter a password');
    if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
    const emailNorm = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(emailNorm)) throw new ApiError(400, 'Please enter a valid email address');
    const exists = await User.findOne({ email: emailNorm });
    if (exists) throw new ApiError(400, 'This email is already registered. Try signing in instead.');

    const user = await User.create({ name: name.trim(), email: emailNorm, password, phone: phone?.trim() || '' });

    const token = generateToken({ id: user._id, role: user.role, accountType: 'customer' });

    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

export const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim()) throw new ApiError(400, 'Please enter your email');
    if (!password) throw new ApiError(400, 'Please enter your password');
    const emailNorm = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm }).select('+password');
    if (!user) throw new ApiError(401, 'Invalid email or password. Please check and try again.');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(401, 'Invalid email or password. Please check and try again.');

    const token = generateToken({ id: user._id, role: user.role, accountType: 'customer' });

    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim()) throw new ApiError(400, 'Please enter your email');
    if (!password) throw new ApiError(400, 'Please enter your password');
    const emailNorm = String(email).trim().toLowerCase();
    const admin = await Admin.findOne({ email: emailNorm }).select('+password');
    if (!admin) throw new ApiError(401, 'Invalid email or password. Please check and try again.');

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) throw new ApiError(401, 'Invalid email or password. Please check and try again.');

    const token = generateToken({ id: admin._id, role: admin.role, accountType: 'admin' });

    res.json({
      success: true,
      token,
      user: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};
