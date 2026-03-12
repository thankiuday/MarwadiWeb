import User from '../models/User.js';
import Admin from '../models/Admin.js';
import ApiError from '../utils/ApiError.js';
import generateToken from '../utils/generateToken.js';

export const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw new ApiError(400, 'Email already registered');

    const user = await User.create({ name, email, password, phone });

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
    if (!email || !password) throw new ApiError(400, 'Email and password are required');

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials');

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
    if (!email || !password) throw new ApiError(400, 'Email and password are required');

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) throw new ApiError(401, 'Invalid credentials');

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials');

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
