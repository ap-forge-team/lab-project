import CommissionHistory from "../models/CommissionHistory.js";

export const exportSettlementHistory = async (req, res) => {
  try {
    const { startDate, endDate, labOwner } = req.query;

    const filter = { settlementStatus: "settled" };

    if (startDate || endDate) {
      filter.settledAt = {};
      if (startDate) filter.settledAt.$gte = new Date(startDate);
      if (endDate) filter.settledAt.$lte = new Date(endDate);
    }

    if (labOwner) filter.labOwner = labOwner;

    const settlements = await CommissionHistory.find(filter)
      .populate("booking", "totalAmount status")
      .populate("labOwner", "name email")
      .sort({ settledAt: -1 });

    const csvData = settlements.map((s) => ({
      date: s.settledAt?.toISOString().split("T")[0] || "",
      labOwner: s.labOwner?.name || "",
      email: s.labOwner?.email || "",
      totalAmount: s.totalAmount || 0,
      commissionPercent: s.commissionPercent || 0,
      commissionAmount: s.commissionAmount || 0,
    }));

    res.status(200).json({
      success: true,
      count: csvData.length,
      data: csvData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
