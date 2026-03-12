import Admin from '../models/Admin.js';
import ApiError from '../utils/ApiError.js';

export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) throw new ApiError(400, 'Email already registered');

    const admin = await Admin.create({
      name,
      email,
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
