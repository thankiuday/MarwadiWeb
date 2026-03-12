import Menu from '../models/Menu.js';
import ApiError from '../utils/ApiError.js';
import cloudinary from '../config/cloudinary.js';

export const getMenuItemById = async (req, res, next) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) throw new ApiError(404, 'Menu item not found');
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const getMenuItems = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.available !== undefined) filter.available = req.query.available === 'true';

    const items = await Menu.find(filter).sort({ category: 1, name: 1 });

    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ success: true, data: items, grouped });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req, res, next) => {
  try {
    const { name, price, description, category, available } = req.body;
    const image = req.file ? req.file.path : '';

    const item = await Menu.create({ name, price, description, image, category, available });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) throw new ApiError(404, 'Menu item not found');

    const { name, price, description, category, available } = req.body;
    if (name !== undefined) item.name = name;
    if (price !== undefined) item.price = price;
    if (description !== undefined) item.description = description;
    if (category !== undefined) item.category = category;
    if (available !== undefined) item.available = available;

    if (req.file) {
      if (item.image) {
        const publicId = item.image.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
      item.image = req.file.path;
    }

    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) throw new ApiError(404, 'Menu item not found');

    if (item.image) {
      const publicId = item.image.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};
