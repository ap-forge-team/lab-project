import CommissionHistory from "../models/CommissionHistory.js";

export const getPendingSettlements = async (req, res) => {
  try {
    const settlements = await CommissionHistory.find({ settlementStatus: "pending" })
      .populate("booking", "totalAmount status")
      .populate("labOwner", "name email")
      .sort({ createdAt: -1 });

    const totalPending = settlements.reduce((sum, s) => sum + (s.commissionAmount || 0), 0);

    res.status(200).json({
      success: true,
      count: settlements.length,
      totalPending,
      data: settlements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const settlePayments = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array of commission history IDs is required",
      });
    }

    const result = await CommissionHistory.updateMany(
      { _id: { $in: ids }, settlementStatus: "pending" },
      { settlementStatus: "settled", settledAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} payment(s) settled successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getSettlementHistory = async (req, res) => {
  try {
    const settlements = await CommissionHistory.find({ settlementStatus: "settled" })
      .populate("booking", "totalAmount status")
      .populate("labOwner", "name email")
      .sort({ settledAt: -1 });

    const totalSettled = settlements.reduce((sum, s) => sum + (s.commissionAmount || 0), 0);

    res.status(200).json({
      success: true,
      count: settlements.length,
      totalSettled,
      data: settlements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
