import Subcategory from "../models/Subcategory.js";
import Category from "../models/Category.js";

export const createSubcategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const existing = await Subcategory.findOne({ name: name.trim(), category });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Subcategory already exists in this category",
      });
    }

    const subcategory = await Subcategory.create({
      name: name.trim(),
      category,
      description: description || "",
    });

    const populated = await subcategory.populate("category", "name");

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      subcategory: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllSubcategories = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const subcategories = await Subcategory.find(filter)
      .populate("category", "name icon")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subcategories.length,
      subcategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate("category", "name");

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    res.status(200).json({
      success: true,
      subcategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    if (name) subcategory.name = name.trim();
    if (description !== undefined) subcategory.description = description;

    await subcategory.save();

    const populated = await subcategory.populate("category", "name");

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      subcategory: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    await subcategory.deleteOne();

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const toggleSubcategoryStatus = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    subcategory.isActive = !subcategory.isActive;
    await subcategory.save();

    res.status(200).json({
      success: true,
      message: `Subcategory ${subcategory.isActive ? "activated" : "deactivated"} successfully`,
      subcategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
