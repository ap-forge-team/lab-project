import Test from "../models/Test.js";
import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";
import MESSAGES from "../Utils/messages.js";
import logger from "../Utils/logger.js";

export const createTest = async (req, res) => {
  try {
    const {
      title,
      shortName,
      category,
      subcategory,
      price,
      discount,
      offerPrice,
      tax,
      reportTime,
      shortDescription,
      preparationInstructions,
      reportIncludes,
      fastingRequired,
      collectionMethod,
      sampleType,
      image,
      displayOrder,
      isActive,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.TEST.TITLE_REQUIRED,
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.TEST.CATEGORY_REQUIRED,
      });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.TEST.VALID_PRICE_REQUIRED,
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.CATEGORY.NOT_FOUND,
      });
    }

    if (subcategory) {
      const subcategoryExists = await Subcategory.findById(subcategory);
      if (!subcategoryExists) {
        return res.status(404).json({
          success: false,
          message: MESSAGES.SUBCATEGORY.NOT_FOUND,
        });
      }

      if (subcategoryExists.category.toString() !== category.toString()) {
        return res.status(400).json({
          success: false,
          message: MESSAGES.TEST.SUBCATEGORY_BELONGS_TO_CATEGORY,
        });
      }
    }

    const existingTest = await Test.findOne({ title: title.trim() });
    if (existingTest) {
      return res.status(409).json({
        success: false,
        message: MESSAGES.TEST.ALREADY_EXISTS,
      });
    }

    const test = await Test.create({
      title: title.trim(),
      shortName: shortName?.trim() || "",
      category,
      ...(subcategory ? { subcategory } : {}),
      price: Number(price),
      discount: Number(discount || 0),
      offerPrice: Number(offerPrice || price),
      tax: Number(tax || 0),
      reportTime: reportTime || "",
      shortDescription: shortDescription || "",
      preparationInstructions: preparationInstructions || "",
      reportIncludes: reportIncludes || "",
      fastingRequired: fastingRequired !== undefined ? fastingRequired : false,
      collectionMethod: collectionMethod || "",
      sampleType: sampleType || "",
      image: req.file?.path || image || "",
      displayOrder: Number(displayOrder || 0),
      isActive: isActive !== undefined ? isActive : true,
    });

    const populatedTest = await Test.findById(test._id)
      .populate("category", "name icon illustration")
      .populate("subcategory", "name description");

    return res.status(201).json({
      success: true,
      message: MESSAGES.TEST.CREATED,
      data: populatedTest,
    });
  } catch (error) {
    logger.error("Create Test Error:", { message: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find()
      .populate("category", "name icon illustration")
      .populate("subcategory", "name description")
      .sort({ displayOrder: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (error) {
    logger.error("Get Tests Error:", { message: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const getSingleTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.TEST.NOT_FOUND,
      });
    }

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    logger.error("Get Test Error:", { message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const updateTest = async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      reportTime,
      shortDescription,
      preparationInstructions,
      reportIncludes,
      fastingRequired,
      collectionMethod,
      sampleType,
      image,
    } = req.body;

    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.TEST.NOT_FOUND,
      });
    }

    if (title) {
      const existingTest = await Test.findOne({
        title: title.trim(),
        _id: { $ne: req.params.id },
      });
      if (existingTest) {
        return res.status(400).json({
          success: false,
          message: MESSAGES.TEST.TITLE_EXISTS,
        });
      }
    }

    test.title = title ?? test.title;
    test.category = category ?? test.category;
    test.price = price ?? test.price;
    test.reportTime = reportTime ?? test.reportTime;
    test.shortDescription = shortDescription ?? test.shortDescription;
    test.preparationInstructions = preparationInstructions ?? test.preparationInstructions;
    test.reportIncludes = reportIncludes ?? test.reportIncludes;
    test.fastingRequired = fastingRequired ?? test.fastingRequired;
    test.collectionMethod = collectionMethod ?? test.collectionMethod;
    test.sampleType = sampleType ?? test.sampleType;
    test.image = req.file?.path ?? image ?? test.image;

    const updatedTest = await test.save();

    res.status(200).json({
      success: true,
      message: MESSAGES.TEST.UPDATED,
      data: updatedTest,
    });
  } catch (error) {
    logger.error("Update Test Error:", { message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.TEST.NOT_FOUND,
      });
    }

    await test.deleteOne();

    res.status(200).json({
      success: true,
      message: MESSAGES.TEST.DELETED,
    });
  } catch (error) {
    logger.error("Delete Test Error:", { message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};
