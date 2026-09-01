import Category from "../models/Category.js";
import Test from "../models/Test.js";
import MESSAGES from "../Utils/messages.js";
import logger from "../Utils/logger.js";

/*
========================================
CREATE CATEGORY
========================================
*/

export const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      icon,
      customIcon,
      illustration,
      displayOrder,
      isActive,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.CATEGORY.NAME_REQUIRED,
      });
    }

    const existingCategory =
      await Category.findOne({
        name: name.trim(),
      });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: MESSAGES.CATEGORY.ALREADY_EXISTS,
      });
    }

    const iconFile = req.files?.icon?.[0];
    const illustrationFile = req.files?.illustration?.[0];
    const customIconFile = req.files?.customIcon?.[0];

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      icon: iconFile?.path || icon || "",
      customIcon: customIconFile?.path || customIcon || "",
      illustration: illustrationFile?.path || illustration || "",
      displayOrder:
        displayOrder !== undefined
          ? Number(displayOrder)
          : 0,
      isActive:
        isActive !== undefined
          ? isActive
          : true,
    });

    return res.status(201).json({
      success: true,
      message: MESSAGES.CATEGORY.CREATED,
      category,
    });
  } catch (error) {
    logger.error("Create Category Error:", { message: error.message, stack: error.stack });

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/*
========================================
GET ALL CATEGORIES
========================================
*/

export const getAllCategories = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      status,
    } = req.query;

    const filter = {};

    if (search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const categories =
      await Category.find(filter)
        .sort({
          displayOrder: 1,
          createdAt: -1,
        })
        .lean();

    /*
      Get test counts
    */

    const categoryIds =
      categories.map(
        (category) => category._id
      );

    const testCounts =
      await Test.aggregate([
        {
          $match: {
            category: {
              $in: categoryIds,
            },
          },
        },

        {
          $group: {
            _id: "$category",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const countMap = {};

    testCounts.forEach((item) => {
      countMap[item._id.toString()] =
        item.count;
    });

    const result =
      categories.map((category) => ({
        ...category,

        testCount:
          countMap[
            category._id.toString()
          ] || 0,
      }));

    return res.status(200).json({
      success: true,
      categories: result,
    });
  } catch (error) {
    logger.error(
      "Get Categories Error:",
      { message: error.message, stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/*
========================================
GET SINGLE CATEGORY
========================================
*/

export const getCategoryById = async (
  req,
  res
) => {
  try {
    const category =
      await Category.findById(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.CATEGORY.NOT_FOUND,
      });
    }

    const testCount =
      await Test.countDocuments({
        category: category._id,
      });

    return res.status(200).json({
      success: true,

      category: {
        ...category.toObject(),
        testCount,
      },
    });
  } catch (error) {
    logger.error(
      "Get Category Error:",
      { message: error.message, stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/*
========================================
UPDATE CATEGORY
========================================
*/

export const updateCategory = async (
  req,
  res
) => {
  try {
    const {
      name,
      description,
      icon,
      customIcon,
      displayOrder,
      isActive,
    } = req.body;

    const category =
      await Category.findById(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.CATEGORY.NOT_FOUND,
      });
    }

    if (name?.trim()) {
      const duplicate =
        await Category.findOne({
          name: name.trim(),
          _id: {
            $ne: req.params.id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            MESSAGES.CATEGORY.DUPLICATE_NAME,
        });
      }

      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description =
        description;
    }

    if (icon !== undefined || req.files?.icon?.length) {
      category.icon =
        req.files?.icon?.[0]?.path || icon;
    }

    if (customIcon !== undefined || req.files?.customIcon?.length) {
      category.customIcon =
        req.files?.customIcon?.[0]?.path || customIcon;
    }

    if (req.files?.illustration?.length) {
      category.illustration =
        req.files.illustration[0].path;
    }

    if (displayOrder !== undefined) {
      category.displayOrder =
        Number(displayOrder);
    }

    if (isActive !== undefined) {
      category.isActive =
        isActive;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message:
        MESSAGES.CATEGORY.UPDATED,
      category,
    });
  } catch (error) {
    logger.error(
      "Update Category Error:",
      { message: error.message, stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/*
========================================
DELETE CATEGORY
========================================
*/

export const deleteCategory = async (
  req,
  res
) => {
  try {
    const category =
      await Category.findById(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.CATEGORY.NOT_FOUND,
      });
    }

    /*
      Don't delete category if
      tests are using it.
    */

    const testCount =
      await Test.countDocuments({
        category: category._id,
      });

    if (testCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          MESSAGES.CATEGORY.CANNOT_DELETE_ASSIGNED(testCount),
      });
    }

    await Category.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        MESSAGES.CATEGORY.DELETED,
    });
  } catch (error) {
    logger.error(
      "Delete Category Error:",
      { message: error.message, stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/*
========================================
TOGGLE STATUS
========================================
*/

export const toggleCategoryStatus =
  async (req, res) => {
    try {
      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res.status(404).json({
          success: false,
          message:
            MESSAGES.CATEGORY.NOT_FOUND,
        });
      }

      category.isActive =
        !category.isActive;

      await category.save();

      return res.status(200).json({
        success: true,
        message: category.isActive
          ? MESSAGES.CATEGORY.ACTIVATED
          : MESSAGES.CATEGORY.DEACTIVATED,

        category,
      });
    } catch (error) {
      logger.error(
        "Toggle Category Error:",
        { message: error.message, stack: error.stack }
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
