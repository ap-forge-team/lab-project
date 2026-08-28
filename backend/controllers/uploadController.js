import Booking from "../models/Booking.js";
import MESSAGES from "../Utils/messages.js";
import logger from "../Utils/logger.js";

export const uploadReport = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.BOOKING.NOT_FOUND,
      });
    }

    booking.report = req.file.path;
    booking.status = "Completed";
    booking.assignedLabAssistant = req.user._id;

    await booking.save();

    res.status(200).json({
      success: true,
      message: MESSAGES.BOOKING.REPORT_UPLOADED,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};
