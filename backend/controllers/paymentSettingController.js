import PaymentSetting from "../models/paymentSetting.js";
import MESSAGES from "../Utils/messages.js";
import logger from "../Utils/logger.js";

export const createPaymentSetting = async (
  req,
  res
) => {

  try {

    const exists =
      await PaymentSetting.findOne();

    if (exists) {

      return res.status(400).json({

        success: false,

        message:
          MESSAGES.PAYMENT.SETTING_EXISTS

      });

    }

    const payment =
      await PaymentSetting.create({

        accountName:
          req.body.accountName,

        upiId:
          req.body.upiId,

        qrImage:
          req.file.path

      });

    res.status(201).json({

      success: true,

      message:
        MESSAGES.PAYMENT.SETTING_CREATED,

      data: payment

    });

  } catch (error) {

    logger.error("Create payment setting error", { message: error.message });

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};



// Get Payment Setting

export const getPaymentSetting =
async (
  req,
  res
) => {

  try {

    const payment =
      await PaymentSetting.findOne();

    res.status(200).json({

      success: true,

      data: payment

    });

  } catch (error) {

    logger.error("Get payment setting error", { message: error.message });

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};




// Update Payment Setting

export const updatePaymentSetting =
async (
  req,
  res
) => {

  try {

    const payment =
      await PaymentSetting.findOne();

    if (!payment) {

      return res.status(404).json({

        success: false,

        message:
          MESSAGES.PAYMENT.SETTING_NOT_FOUND

      });

    }

    payment.accountName =
      req.body.accountName;

    payment.upiId =
      req.body.upiId;

    if (req.file) {

      payment.qrImage =
        req.file.path;

    }

    await payment.save();

    res.status(200).json({

      success: true,

      message:
        MESSAGES.PAYMENT.SETTING_UPDATED,

      data: payment

    });

  } catch (error) {

    logger.error("Update payment setting error", { message: error.message });

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};




// Delete

export const deletePaymentSetting =
async (
  req,
  res
) => {

  try {

    const payment =
      await PaymentSetting.findOne();

    if (!payment) {

      return res.status(404).json({

        success: false,

        message:
          MESSAGES.PAYMENT.SETTING_NOT_FOUND

      });

    }

    await PaymentSetting.findByIdAndDelete(
      payment._id
    );

    res.json({

      success: true,

      message:
        MESSAGES.PAYMENT.SETTING_DELETED

    });

  } catch (error) {

    logger.error("Delete payment setting error", { message: error.message });

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};
