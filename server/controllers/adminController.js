import Admin from '../models/Admin.js';
import ApiError from '../utils/ApiError.js';

export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name?.trim()) throw new ApiError(400, 'Please enter the admin name');
    if (!email?.trim()) throw new ApiError(400, 'Please enter the admin email');
    if (!password) throw new ApiError(400, 'Please enter a password');
    if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
    const emailNorm = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(emailNorm)) throw new ApiError(400, 'Please enter a valid email address');

    const exists = await Admin.findOne({ email: emailNorm });
    if (exists) throw new ApiError(400, 'This email is already in use.');

    const admin = await Admin.create({
      name: name.trim(),
      email: emailNorm,
      password,
      role: role || 'admin',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmins = async (_req, res, next) => {
  try {
    const admins = await Admin.find().select('-password').populate('createdBy', 'name');
    res.json({ success: true, data: admins });
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) throw new ApiError(404, 'Admin not found');
    if (admin.role === 'superadmin') throw new ApiError(403, 'Cannot delete super admin');

    await admin.deleteOne();
    res.json({ success: true, message: 'Admin deleted' });
  } catch (error) {
    next(error);
  }
};
