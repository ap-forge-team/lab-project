import CommissionSetting from "../models/CommissionSetting.js";
import CommissionHistory from "../models/CommissionHistory.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

export const getCommissionSettings = async (req, res) => {
  try {
    const settings = await CommissionSetting.find()
      .populate("labOwner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: settings.length,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getCommissionSettingByLabOwner = async (req, res) => {
  try {
    const setting = await CommissionSetting.findOne({ labOwner: req.params.labOwnerId })
      .populate("labOwner", "name email");

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Commission setting not found for this lab owner",
      });
    }

    res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const createOrUpdateCommissionSetting = async (req, res) => {
  try {
    const { labOwner, commissionPercent } = req.body;

    if (!labOwner || commissionPercent === undefined) {
      return res.status(400).json({
        success: false,
        message: "labOwner and commissionPercent are required",
      });
    }

    const user = await User.findById(labOwner);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Lab owner not found",
      });
    }

    let setting = await CommissionSetting.findOne({ labOwner });

    if (setting) {
      setting.commissionPercent = commissionPercent;
      await setting.save();
    } else {
      setting = await CommissionSetting.create({ labOwner, commissionPercent });
    }

    res.status(200).json({
      success: true,
      message: "Commission setting saved successfully",
      data: setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteCommissionSetting = async (req, res) => {
  try {
    const setting = await CommissionSetting.findById(req.params.id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Commission setting not found",
      });
    }

    await setting.deleteOne();

    res.status(200).json({
      success: true,
      message: "Commission setting deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getCommissionHistory = async (req, res) => {
  try {
    const { labOwner, settlementStatus } = req.query;
    const filter = {};
    if (labOwner) filter.labOwner = labOwner;
    if (settlementStatus) filter.settlementStatus = settlementStatus;

    const history = await CommissionHistory.find(filter)
      .populate("booking", "totalAmount status")
      .populate("labOwner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const createCommissionEntry = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const setting = await CommissionSetting.findOne({ labOwner: booking.labOwner });
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "No commission setting found for this lab owner",
      });
    }

    const totalAmount = booking.totalAmount || 0;
    const commissionAmount = (totalAmount * setting.commissionPercent) / 100;

    const entry = await CommissionHistory.create({
      booking: bookingId,
      labOwner: booking.labOwner,
      totalAmount,
      commissionPercent: setting.commissionPercent,
      commissionAmount,
    });

    res.status(201).json({
      success: true,
      message: "Commission entry created",
      data: entry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
