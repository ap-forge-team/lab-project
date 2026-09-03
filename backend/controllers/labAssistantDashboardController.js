import Booking from "../models/Booking.js";

const generateBookingId = (b) => {
  return b.reportId || `BKD-${new Date(b.createdAt).getFullYear()}-${b._id.toString().slice(-4).toUpperCase()}`;
};

export const getLabAssistantDashboardStats = async (req, res) => {
  try {
    const assistantId = req.user._id;
    const { from, to } = req.query;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const baseFilter = { assignedLabAssistant: assistantId };
    if (from || to) {
      baseFilter.createdAt = {};
      if (from) baseFilter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        baseFilter.createdAt.$lte = toDate;
      }
    }

    const [
      todayCollections,
      samplesCollected,
      samplesInLab,
      testsInProgress,
      testsPending,
      recentSampleCollections,
      todayBookings,
      samplesInLabList,
      weeklySamples,
      sampleCollectionStatus,
      samplesByType,
      recentActivity,
    ] = await Promise.all([
      Booking.countDocuments({
        ...baseFilter,
        sampleCollectedAt: { $gte: new Date(now.setHours(0, 0, 0, 0)), $lte: new Date() },
      }),
      Booking.countDocuments({
        ...baseFilter,
        status: { $in: ["Sample Collected", "Completed"] },
      }),
      Booking.countDocuments({
        ...baseFilter,
        status: { $in: ["Reached", "Sample Collected"] },
      }),
      Booking.countDocuments({
        ...baseFilter,
        status: { $in: ["Assigned", "Reached"] },
      }),
      Booking.countDocuments({
        ...baseFilter,
        status: { $in: ["Pending", "Assigned"] },
      }),
      Booking.find({
        ...baseFilter,
        status: { $in: ["Sample Collected", "Completed"] },
      })
        .populate("user", "name")
        .populate("test", "title sampleType")
        .populate("package", "title")
        .sort({ sampleCollectedAt: -1 })
        .limit(5),
      Booking.find({
        ...baseFilter,
        bookingDate: todayStr,
      })
        .populate("user", "name")
        .populate("test", "title")
        .populate("package", "title")
        .sort({ bookingTime: 1 })
        .limit(10),
      Booking.find({
        ...baseFilter,
        status: { $in: ["Reached", "Sample Collected"] },
      })
        .populate("user", "name")
        .populate("test", "title sampleType")
        .populate("package", "title")
        .sort({ updatedAt: -1 })
        .limit(10),
      Booking.aggregate([
        { $match: { ...baseFilter, sampleCollectedAt: { $gte: startOfWeek } } },
        {
          $group: {
            _id: { $dayOfWeek: "$sampleCollectedAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Booking.aggregate([
        { $match: { ...baseFilter } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Booking.aggregate([
        { $match: { ...baseFilter, sampleCollectedAt: { $gte: startOfWeek } } },
        {
          $lookup: {
            from: "tests",
            localField: "test",
            foreignField: "_id",
            as: "testInfo",
          },
        },
        { $unwind: { path: "$testInfo", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ["$testInfo.sampleType", "Unknown"] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Booking.find({
        ...baseFilter,
        updatedAt: { $gte: sevenDaysAgo },
      })
        .populate("user", "name")
        .populate("test", "title")
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("status updatedAt sampleId patientName"),
    ]);

    const samplesByTypeMap = {};
    samplesByType.forEach((item) => {
      samplesByTypeMap[item._id] = item.count;
    });

    const sampleCollectionStatusMap = {};
    sampleCollectionStatus.forEach((item) => {
      sampleCollectionStatusMap[item._id] = item.count;
    });

    const dayMap = { 1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat" };
    const weeklySamplesData = [];
    for (let i = 1; i <= 7; i++) {
      const found = weeklySamples.find((item) => item._id === i);
      weeklySamplesData.push({
        day: dayMap[i],
        count: found ? found.count : 0,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stats: {
          todayCollections,
          samplesCollected,
          samplesInLab,
          testsInProgress,
          testsPending,
        },
        recentSampleCollections: recentSampleCollections.map((b) => ({
          _id: b._id,
          bookingId: generateBookingId(b),
          patientName: b.patientName || b.user?.name || "N/A",
          sampleType: b.test?.sampleType || b.test?.title || b.package?.title || "N/A",
          collectionTime: b.sampleCollectedAt || b.updatedAt,
          status: b.status,
        })),
        todayBookings: todayBookings.map((b) => ({
          _id: b._id,
          bookingId: generateBookingId(b),
          patientName: b.patientName || b.user?.name || "N/A",
          time: b.bookingTime,
          status: b.status,
        })),
        samplesInLabList: samplesInLabList.map((b) => ({
          _id: b._id,
          sampleId: b.sampleId || `SMP-${new Date(b.createdAt).getFullYear()}-${b._id.toString().slice(-4).toUpperCase()}`,
          patientName: b.patientName || b.user?.name || "N/A",
          testName: b.test?.title || b.package?.title || "N/A",
          receivedTime: b.updatedAt,
          status: b.status,
        })),
        weeklySamples: weeklySamplesData,
        sampleCollectionStatus: {
          collected: sampleCollectionStatusMap["Sample Collected"] || 0,
          pending: sampleCollectionStatusMap["Assigned"] || sampleCollectionStatusMap["Reached"] || 0,
          inTransit: sampleCollectionStatusMap["Processing"] || 0,
          failed: 0,
        },
        samplesByType: Object.entries(samplesByTypeMap).map(([type, count]) => ({
          type,
          count,
        })),
        recentActivity: recentActivity.map((b) => ({
          _id: b._id,
          type: b.status === "Sample Collected" ? "Sample collected" : "Sample handed to lab",
          bookingId: generateBookingId(b),
          patientName: b.patientName || b.user?.name || "N/A",
          time: b.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Lab Assistant Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};
