import Subcategory from "../models/Subcategory.js";
import Category from "../models/Category.js";
import Test from "../models/Test.js";
import MESSAGES from "../Utils/messages.js";
import logger from "../Utils/logger.js";

/*
========================================
CREATE SUBCATEGORY
========================================
*/

export const createSubcategory = async (
  req,
  res
) => {
  try {
    const {
      category,
      name,
      description,
      displayOrder,
      isActive,
    } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.SUBCATEGORY.CATEGORY_REQUIRED,
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          MESSAGES.SUBCATEGORY.NAME_REQUIRED,
      });
    }

    // Check category exists

    const categoryExists =
      await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.CATEGORY.NOT_FOUND,
      });
    }

    // Check duplicate

    const existing =
      await Subcategory.findOne({
        category,
        name: name.trim(),
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          MESSAGES.SUBCATEGORY.ALREADY_EXISTS,
      });
    }

    const subcategory =
      await Subcategory.create({
        category,
        name: name.trim(),
        description:
          description || "",
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
      message:
        MESSAGES.SUBCATEGORY.CREATED,
      subcategory,
    });
  } catch (error) {
    logger.error(
      "Create Subcategory:",
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
GET ALL SUBCATEGORIES
========================================
*/

export const getAllSubcategories =
  async (req, res) => {
    try {
      const {
        category,
        search = "",
        status,
      } = req.query;

      const filter = {};

      if (category) {
        filter.category = category;
      }

      if (search.trim()) {
        filter.name = {
          $regex: search.trim(),
          $options: "i",
        };
      }

      if (status === "inactive") {
        filter.isActive = false;
      } else {
        filter.isActive = true;
      }

      const subcategories =
        await Subcategory.find(filter)
          .populate(
            "category",
            "name icon"
          )
          .sort({
            displayOrder: 1,
            createdAt: -1,
          })
          .lean();

      // Get test counts

      const ids =
        subcategories.map(
          (item) => item._id
        );

      const testCounts =
        await Test.aggregate([
          {
            $match: {
              subcategory: {
                $in: ids,
              },
            },
          },

          {
            $group: {
              _id: "$subcategory",
              count: {
                $sum: 1,
              },
            },
          },
        ]);

      const countMap = {};

      testCounts.forEach((item) => {
        countMap[
          item._id.toString()
        ] = item.count;
      });

      const result =
        subcategories.map(
          (item) => ({
            ...item,

            testCount:
              countMap[
                item._id.toString()
              ] || 0,
          })
        );

      return res.status(200).json({
        success: true,
        subcategories: result,
      });
    } catch (error) {
      logger.error(
        "Get Subcategories:",
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
GET SUBCATEGORY BY ID
========================================
*/

export const getSubcategoryById =
  async (req, res) => {
    try {
      const subcategory =
        await Subcategory.findById(
          req.params.id
        ).populate(
          "category",
          "name icon"
        );

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message:
            MESSAGES.SUBCATEGORY.NOT_FOUND,
        });
      }

      const testCount =
        await Test.countDocuments({
          subcategory:
            subcategory._id,
        });

      return res.status(200).json({
        success: true,
        subcategory: {
          ...subcategory.toObject(),
          testCount,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


/*
========================================
UPDATE SUBCATEGORY
========================================
*/

export const updateSubcategory =
  async (req, res) => {
    try {
      const {
        category,
        name,
        description,
        displayOrder,
        isActive,
      } = req.body;

      const subcategory =
        await Subcategory.findById(
          req.params.id
        );

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message:
            MESSAGES.SUBCATEGORY.NOT_FOUND,
        });
      }

      // If category is changed,
      // verify new category.

      if (category) {
        const categoryExists =
          await Category.findById(
            category
          );

        if (!categoryExists) {
          return res.status(404).json({
            success: false,
            message:
              MESSAGES.CATEGORY.NOT_FOUND,
          });
        }

        subcategory.category =
          category;
      }

      if (name?.trim()) {
        const duplicate =
          await Subcategory.findOne({
            category:
              category ||
              subcategory.category,

            name: name.trim(),

            _id: {
              $ne: req.params.id,
            },
          });

        if (duplicate) {
          return res.status(409).json({
            success: false,
            message:
              MESSAGES.SUBCATEGORY.ALREADY_EXISTS,
          });
        }

        subcategory.name =
          name.trim();
      }

      if (
        description !== undefined
      ) {
        subcategory.description =
          description;
      }

      if (
        displayOrder !== undefined
      ) {
        subcategory.displayOrder =
          Number(displayOrder);
      }

      if (
        isActive !== undefined
      ) {
        subcategory.isActive =
          isActive;
      }

      await subcategory.save();

      return res.status(200).json({
        success: true,
        message:
          MESSAGES.SUBCATEGORY.UPDATED,
        subcategory,
      });
    } catch (error) {
      logger.error(
        "Update Subcategory:",
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
DELETE SUBCATEGORY
========================================
*/

export const deleteSubcategory =
  async (req, res) => {
    try {
      const subcategory =
        await Subcategory.findById(
          req.params.id
        );

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message:
            MESSAGES.SUBCATEGORY.NOT_FOUND,
        });
      }

      // Don't delete if tests exist

      const testCount =
        await Test.countDocuments({
          subcategory:
            subcategory._id,
        });

      if (testCount > 0) {
        return res.status(400).json({
          success: false,
          message:
            MESSAGES.SUBCATEGORY.CANNOT_DELETE_ASSIGNED(testCount),
        });
      }

      await Subcategory.findByIdAndDelete(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message:
          MESSAGES.SUBCATEGORY.DELETED,
      });
    } catch (error) {
      logger.error(
        "Delete Subcategory:",
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

export const toggleSubcategoryStatus =
  async (req, res) => {
    try {
      const subcategory =
        await Subcategory.findById(
          req.params.id
        );

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message:
            MESSAGES.SUBCATEGORY.NOT_FOUND,
        });
      }

      subcategory.isActive =
        !subcategory.isActive;

      await subcategory.save();

      return res.status(200).json({
        success: true,
        message:
          subcategory.isActive
            ? MESSAGES.SUBCATEGORY.ACTIVATED
            : MESSAGES.SUBCATEGORY.DEACTIVATED,

        subcategory,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
