import Package from "../models/Package.js";
import Category from "../models/Category.js";
import Test from "../models/Test.js";
import MESSAGES from "../Utils/messages.js";
import logger from "../Utils/logger.js";

// Convert testsIncluded sent as a comma-separated string
// (typical of multipart/form-data) into an array.
const toTestIdsArray = (testsIncluded) => {
  if (Array.isArray(testsIncluded)) {
    return testsIncluded.map((id) => id.toString()).filter(Boolean);
  }

  if (typeof testsIncluded === "string") {
    return testsIncluded
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }

  return [];
};

// =====================================================
// CREATE PACKAGE
// =====================================================

export const createPackage = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      testsIncluded,
      image,
      category,
      displayOrder,
      isActive,
    } = req.body;

    // ---------------------------------------------
    // Validate title
    // ---------------------------------------------

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.PACKAGE.TITLE_REQUIRED,
      });
    }

    // ---------------------------------------------
    // Validate category
    // ---------------------------------------------

    if (!category) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.PACKAGE.CATEGORY_REQUIRED,
      });
    }

    // ---------------------------------------------
    // Validate price
    // ---------------------------------------------

    if (
      price === undefined ||
      price === null ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.PACKAGE.VALID_PRICE_REQUIRED,
      });
    }

    // ---------------------------------------------
    // Validate tests
    // Minimum 1 test required
    // ---------------------------------------------

    if (toTestIdsArray(testsIncluded).length < 1) {
      return res.status(400).json({
        success: false,
        message:
          MESSAGES.PACKAGE.MIN_ONE_TEST,
      });
    }

    // ---------------------------------------------
    // Check category exists
    // ---------------------------------------------

    const categoryExists =
      await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.CATEGORY.NOT_FOUND,
      });
    }

    // ---------------------------------------------
    // Check duplicate package
    // ---------------------------------------------

    const existingPackage =
      await Package.findOne({
        title: title.trim(),
      });

    if (existingPackage) {
      return res.status(409).json({
        success: false,
        message: MESSAGES.PACKAGE.ALREADY_EXISTS,
      });
    }

    // ---------------------------------------------
    // Remove duplicate test IDs
    // ---------------------------------------------

    const testIds = [
      ...new Set(toTestIdsArray(testsIncluded)),
    ];

    // ---------------------------------------------
    // Check all tests exist
    // ---------------------------------------------

    const validTests =
      await Test.find({
        _id: {
          $in: testIds,
        },
      }).select("_id");

    if (
      validTests.length !==
      testIds.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          MESSAGES.PACKAGE.INVALID_TESTS,
      });
    }

    // ---------------------------------------------
    // Create package
    // ---------------------------------------------

    const newPackage =
      await Package.create({
        title: title.trim(),

        description:
          description?.trim() || "",

        price: Number(price),

        testsIncluded: testIds,

        image: req.file?.path || image || "",

        category,

        displayOrder:
          displayOrder !== undefined
            ? Number(displayOrder)
            : 0,

        isActive:
          isActive !== undefined
            ? isActive
            : true,
      });

    // ---------------------------------------------
    // Populate created package
    // ---------------------------------------------

    const populatedPackage =
      await Package.findById(
        newPackage._id
      )
        .populate(
          "category",
          "name icon illustration"
        )
        .populate(
          "testsIncluded",
          "title shortName price reportTime"
        );

    return res.status(201).json({
      success: true,
      message:
        MESSAGES.PACKAGE.CREATED,
      data: populatedPackage,
    });

  } catch (error) {
    logger.error(
      "Create Package Error:",
      { message: error.message, stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET ALL PACKAGES
// =====================================================

export const getAllPackages = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      category,
      status,
    } = req.query;

    const filter = {};

    // ---------------------------------------------
    // Search
    // ---------------------------------------------

    if (search.trim()) {
      filter.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // ---------------------------------------------
    // Category filter
    // ---------------------------------------------

    if (category) {
      filter.category = category;
    }

    // ---------------------------------------------
    // Status filter
    // ---------------------------------------------

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    // ---------------------------------------------
    // Get packages
    // ---------------------------------------------

    const packages =
      await Package.find(filter)
        .populate(
          "category",
          "name icon illustration"
        )
        .populate(
          "testsIncluded",
          "title shortName price reportTime"
        )
        .sort({
          displayOrder: 1,
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });

  } catch (error) {
    logger.error(
      "Get Packages Error:",
      { message: error.message, stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET SINGLE PACKAGE
// =====================================================

export const getSinglePackage = async (
  req,
  res
) => {
  try {
    const packageData =
      await Package.findById(
        req.params.id
      )
        .populate(
          "category",
          "name icon illustration"
        )
        .populate(
          "testsIncluded",
          "title shortName price reportTime shortDescription"
        );

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.PACKAGE.NOT_FOUND,
      });
    }

    return res.status(200).json({
      success: true,
      data: packageData,
    });

  } catch (error) {
    logger.error(
      "Get Package Error:",
      { message: error.message, stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// UPDATE PACKAGE
// =====================================================

export const updatePackage = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
      price,
      testsIncluded,
      image,
      category,
      displayOrder,
      isActive,
    } = req.body;

    // ---------------------------------------------
    // Find package
    // ---------------------------------------------

    const packageData =
      await Package.findById(
        req.params.id
      );

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.PACKAGE.NOT_FOUND,
      });
    }

    // ---------------------------------------------
    // Validate title
    // ---------------------------------------------

    if (
      title !== undefined &&
      !title?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          MESSAGES.PACKAGE.TITLE_EMPTY,
      });
    }

    // ---------------------------------------------
    // Duplicate title
    // ---------------------------------------------

    if (title !== undefined) {
      const existingPackage =
        await Package.findOne({
          title: title.trim(),
          _id: {
            $ne: req.params.id,
          },
        });

      if (existingPackage) {
        return res.status(409).json({
          success: false,
          message:
            MESSAGES.PACKAGE.TITLE_EXISTS,
        });
      }
    }

    // ---------------------------------------------
    // Validate category
    // ---------------------------------------------

    if (category !== undefined) {
      const categoryExists =
        await Category.findById(
          category
        );

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: MESSAGES.CATEGORY.NOT_FOUND,
        });
      }
    }

    // ---------------------------------------------
    // Validate price
    // ---------------------------------------------

    if (price !== undefined) {
      if (
        price === null ||
        Number(price) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            MESSAGES.PACKAGE.VALID_PRICE_REQUIRED,
        });
      }
    }

    // ---------------------------------------------
    // Validate tests
    // Only validate when sent in request
    // ---------------------------------------------

    if (testsIncluded !== undefined) {
      const testIds = toTestIdsArray(testsIncluded);

      if (testIds.length < 1) {
        return res.status(400).json({
          success: false,
          message: MESSAGES.PACKAGE.MIN_ONE_TEST,
        });
      }

      // Remove duplicate IDs
      const uniqueTestIds = [...new Set(testIds)];

      const validTests =
        await Test.find({
          _id: {
            $in: uniqueTestIds,
          },
        }).select("_id");

      if (
        validTests.length !==
        uniqueTestIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            MESSAGES.PACKAGE.INVALID_TESTS,
        });
      }

      packageData.testsIncluded =
        uniqueTestIds;
    }

    // ---------------------------------------------
    // Update fields
    // ---------------------------------------------

    if (title !== undefined) {
      packageData.title =
        title.trim();
    }

    if (description !== undefined) {
      packageData.description =
        description.trim();
    }

    if (price !== undefined) {
      packageData.price =
        Number(price);
    }

    if (image !== undefined || req.file?.path) {
      packageData.image =
        req.file?.path || image;
    }

    if (category !== undefined) {
      packageData.category =
        category;
    }

    if (displayOrder !== undefined) {
      packageData.displayOrder =
        Number(displayOrder);
    }

    if (isActive !== undefined) {
      packageData.isActive =
        isActive;
    }

    // ---------------------------------------------
    // Save
    // ---------------------------------------------

    await packageData.save();

    // ---------------------------------------------
    // Populate response
    // ---------------------------------------------

    const updatedPackage =
      await Package.findById(
        packageData._id
      )
        .populate(
          "category",
          "name icon illustration"
        )
        .populate(
          "testsIncluded",
          "title shortName price reportTime"
        );

    return res.status(200).json({
      success: true,
      message:
        MESSAGES.PACKAGE.UPDATED,
      data: updatedPackage,
    });

  } catch (error) {
    logger.error(
      "Update Package Error:",
      { message: error.message, stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// DELETE PACKAGE
// =====================================================

export const deletePackage = async (
  req,
  res
) => {
  try {
    const packageData =
      await Package.findById(
        req.params.id
      );

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.PACKAGE.NOT_FOUND,
      });
    }

    await Package.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        MESSAGES.PACKAGE.DELETED,
    });

  } catch (error) {
    logger.error(
      "Delete Package Error:",
      { message: error.message, stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// TOGGLE PACKAGE STATUS
// =====================================================

export const togglePackageStatus =
  async (req, res) => {
    try {
      const packageData =
        await Package.findById(
          req.params.id
        );

      if (!packageData) {
        return res.status(404).json({
          success: false,
          message:
            MESSAGES.PACKAGE.NOT_FOUND,
        });
      }

      packageData.isActive =
        !packageData.isActive;

      await packageData.save();

      return res.status(200).json({
        success: true,
        message:
          packageData.isActive
            ? MESSAGES.PACKAGE.ACTIVATED
            : MESSAGES.PACKAGE.DEACTIVATED,
        data: packageData,
      });

    } catch (error) {
      logger.error(
        "Toggle Package Error:",
        { message: error.message, stack: error.stack }
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
