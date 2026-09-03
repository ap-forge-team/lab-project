import Booking from "../models/Booking.js";
import Test from "../models/Test.js";
import Package from "../models/Package.js";
import User from "../models/User.js";
import Category from "../models/Category.js";

export const getLabOwnerDashboardStats = async (req, res) => {
  try {
    const labOwnerId = req.user._id;
    const { from, to } = req.query;

    const dateFilter = { labOwner: labOwnerId };
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = toDate;
      }
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalBookings,
      totalBookingsLast7,
      totalBookingsPrev7,
      samplesCollected,
      samplesCollectedLast7,
      samplesCollectedPrev7,
      testsCompleted,
      testsCompletedLast7,
      testsCompletedPrev7,
      pendingReports,
      pendingReportsLast7,
      pendingReportsPrev7,
      allBookings,
      recentBookings,
      allPaidBookings,
      assistants,
      weekBookings,
    ] = await Promise.all([
      Booking.countDocuments(dateFilter),
      Booking.countDocuments({ ...dateFilter, createdAt: { $gte: sevenDaysAgo, $lte: now } }),
      Booking.countDocuments({ ...dateFilter, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      Booking.countDocuments({ ...dateFilter, status: { $in: ["Sample Collected", "Completed"] } }),
      Booking.countDocuments({ ...dateFilter, status: { $in: ["Sample Collected", "Completed"] }, createdAt: { $gte: sevenDaysAgo, $lte: now } }),
      Booking.countDocuments({ ...dateFilter, status: { $in: ["Sample Collected", "Completed"] }, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      Booking.countDocuments({ ...dateFilter, status: "Completed" }),
      Booking.countDocuments({ ...dateFilter, status: "Completed", createdAt: { $gte: sevenDaysAgo, $lte: now } }),
      Booking.countDocuments({ ...dateFilter, status: "Completed", createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      Booking.countDocuments({ ...dateFilter, status: { $in: ["Processing", "Sample Collected"] } }),
      Booking.countDocuments({ ...dateFilter, status: { $in: ["Processing", "Sample Collected"] }, createdAt: { $gte: sevenDaysAgo, $lte: now } }),
      Booking.countDocuments({ ...dateFilter, status: { $in: ["Processing", "Sample Collected"] }, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      Booking.find(dateFilter)
        .populate("test", "title price category")
        .populate("package", "title price category")
        .populate("assignedLabAssistant", "name")
        .sort({ createdAt: -1 }),
      Booking.find(dateFilter)
        .populate("test", "title price")
        .populate("package", "title price")
        .sort({ createdAt: -1 })
        .limit(5),
      Booking.find({ ...dateFilter, paymentStatus: "Paid" })
        .populate("test", "title price")
        .populate("package", "title price")
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({ labOwner: labOwnerId, role: "lab_assistant" }),
      Booking.find({ ...dateFilter, createdAt: { $gte: startOfWeek, $lte: now } }),
    ]);

    const totalRevenue = allBookings.reduce((sum, b) => {
      if (b.paymentStatus === "Paid") {
        return sum + (b.totalAmount || b.paymentAmount || b.test?.price || b.package?.price || 0);
      }
      return sum;
    }, 0);

    const weekRevenue = weekBookings.reduce((sum, b) => {
      if (b.paymentStatus === "Paid") {
        return sum + (b.totalAmount || b.paymentAmount || b.test?.price || b.package?.price || 0);
      }
      return sum;
    }, 0);

    const calcTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
      totalBookings,
      totalBookingsTrend: calcTrend(totalBookingsLast7, totalBookingsPrev7),
      samplesCollected,
      samplesCollectedTrend: calcTrend(samplesCollectedLast7, samplesCollectedPrev7),
      testsCompleted,
      testsCompletedTrend: calcTrend(testsCompletedLast7, testsCompletedPrev7),
      totalRevenue,
      totalRevenueTrend: 14,
      pendingReports,
      pendingReportsTrend: calcTrend(pendingReportsLast7, pendingReportsPrev7),
    };

    const weekStats = {
      samplesCollected: weekBookings.filter(b => ["Sample Collected", "Completed"].includes(b.status)).length,
      reportsCompleted: weekBookings.filter(b => b.status === "Completed").length,
      reportsPending: weekBookings.filter(b => ["Processing", "Sample Collected"].includes(b.status)).length,
      reportsOverdue: weekBookings.filter(b => {
        if (b.status === "Processing" && b.createdAt) {
          const daysSince = Math.floor((now - new Date(b.createdAt)) / 86400000);
          return daysSince > 3;
        }
        return false;
      }).length,
    };

    const recentBookingsList = recentBookings.map((b) => ({
      _id: b._id,
      bookingId: b.reportId || `BKD-${new Date(b.createdAt).getFullYear()}-${b._id.toString().slice(-4).toUpperCase()}`,
      patientName: b.patientName,
      testName: b.test?.title || b.package?.title || "N/A",
      status: b.status,
      createdAt: b.createdAt,
    }));

    const pendingReportsList = allBookings
      .filter(b => ["Processing", "Sample Collected"].includes(b.status))
      .slice(0, 5)
      .map((b) => {
        const createdAt = new Date(b.createdAt);
        const daysSince = Math.floor((now - createdAt) / 86400000);
        let dueStatus = "On Time";
        if (daysSince > 3) dueStatus = "Overdue";
        else if (daysSince === 3) dueStatus = "Due Today";
        else if (daysSince === 2) dueStatus = "Due Tomorrow";

        return {
          _id: b._id,
          bookingId: b.reportId || `BKD-${new Date(b.createdAt).getFullYear()}-${b._id.toString().slice(-4).toUpperCase()}`,
          patientName: b.patientName,
          testName: b.test?.title || b.package?.title || "N/A",
          dueDate: new Date(createdAt.getTime() + 4 * 86400000),
          dueStatus,
        };
      });

    const recentPayments = allPaidBookings.map((b) => ({
      _id: b._id,
      invoiceId: b.transactionId || `INV-${new Date(b.createdAt).getFullYear()}-${b._id.toString().slice(-4).toUpperCase()}`,
      amount: b.totalAmount || b.paymentAmount || b.test?.price || b.package?.price || 0,
      status: b.paymentStatus,
      date: b.createdAt,
    }));

    const testCategoryMap = {};
    allBookings.forEach((b) => {
      const category = b.test?.category || b.package?.category;
      if (category) {
        const catId = category.toString();
        if (!testCategoryMap[catId]) {
          testCategoryMap[catId] = 0;
        }
        testCategoryMap[catId] += 1;
      }
    });

    const categoryIds = Object.keys(testCategoryMap);
    const categories = categoryIds.length > 0
      ? await Category.find({ _id: { $in: categoryIds } })
      : [];
    const categoryMap = {};
    categories.forEach(c => { categoryMap[c._id.toString()] = c.name; });

    const testsByCategory = Object.entries(testCategoryMap)
      .map(([id, count]) => ({
        name: categoryMap[id] || "Others",
        value: count,
      }))
      .sort((a, b) => b.value - a.value);

    const sampleStatus = {
      Collected: allBookings.filter(b => ["Sample Collected", "Completed"].includes(b.status)).length,
      Pending: allBookings.filter(b => ["Pending", "Assigned", "Reached"].includes(b.status)).length,
      Failed: allBookings.filter(b => b.status === "Cancelled").length,
    };

    const sampleCollectionData = Object.entries(sampleStatus)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));

    const testBookingMap = {};
    allBookings.forEach((b) => {
      const testId = b.test?._id?.toString();
      if (testId && b.test?.title) {
        if (!testBookingMap[testId]) {
          testBookingMap[testId] = { name: b.test.title, count: 0 };
        }
        testBookingMap[testId].count += 1;
      }
    });
    const topTests = Object.values(testBookingMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const dayBookings = allBookings.filter((b) => {
        const bDate = new Date(b.createdAt).toISOString().slice(0, 10);
        return bDate === dayStr;
      });
      last7Days.push({
        date: dayLabel,
        total: dayBookings.length,
        completed: dayBookings.filter((b) => b.status === "Completed").length,
        pending: dayBookings.filter((b) => b.status === "Pending").length,
        cancelled: dayBookings.filter((b) => b.status === "Cancelled").length,
      });
    }

    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const dayRevenue = allBookings
        .filter((b) => {
          const bDate = new Date(b.createdAt).toISOString().slice(0, 10);
          return bDate === dayStr && b.paymentStatus === "Paid";
        })
        .reduce((sum, b) => sum + (b.totalAmount || b.paymentAmount || b.test?.price || b.package?.price || 0), 0);
      dailyRevenue.push({
        date: dayLabel,
        revenue: dayRevenue,
      });
    }

    const activityItems = [];
    recentBookings.slice(0, 3).forEach((b) => {
      activityItems.push({
        type: "booking",
        title: "New booking received",
        description: `Booking ID: ${b.reportId || `BKD-${new Date(b.createdAt).getFullYear()}-${b._id.toString().slice(-4).toUpperCase()}`} for ${b.test?.title || b.package?.title || "N/A"}`,
        timestamp: b.createdAt,
      });
    });

    allBookings
      .filter(b => b.status === "Sample Collected")
      .slice(0, 2)
      .forEach((b) => {
        activityItems.push({
          type: "sample",
          title: "Sample collected",
          description: `Booking ID: BKD-${new Date(b.createdAt).getFullYear()}-${b._id.toString().slice(-4).toUpperCase()} - ${b.test?.title || b.package?.title || "N/A"}`,
          timestamp: b.sampleCollectedAt || b.updatedAt,
        });
      });

    allBookings
      .filter(b => b.report)
      .slice(0, 2)
      .forEach((b) => {
        activityItems.push({
          type: "report",
          title: "Report uploaded",
          description: `Booking ID: BKD-${new Date(b.createdAt).getFullYear()}-${b._id.toString().slice(-4).toUpperCase()} - ${b.test?.title || b.package?.title || "N/A"}`,
          timestamp: b.updatedAt,
        });
      });

    const recentPaid = allPaidBookings.slice(0, 2);
    recentPaid.forEach((b) => {
      activityItems.push({
        type: "payment",
        title: "Payment received",
        description: `Invoice ${b.transactionId || `INV-${new Date(b.createdAt).getFullYear()}-${b._id.toString().slice(-4).toUpperCase()}`} of ₹${(b.totalAmount || b.paymentAmount || 0).toLocaleString("en-IN")}`,
        timestamp: b.createdAt,
      });
    });

    activityItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const getRelativeTime = (date) => {
      const diffMs = Date.now() - new Date(date).getTime();
      const mins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMs / 3600000);
      const days = Math.floor(diffMs / 86400000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins} min ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
      return `${days} day${days > 1 ? "s" : ""} ago`;
    };

    const assistantsList = assistants.map((a) => ({
      _id: a._id,
      name: a.name,
      role: "Lab Assistant",
      isActive: true,
    }));

    res.json({
      success: true,
      stats,
      weekStats,
      recentBookings: recentBookingsList,
      pendingReports: pendingReportsList,
      recentPayments,
      topTests,
      testsByCategory,
      sampleCollectionData,
      bookingsOverview: last7Days,
      revenueOverview: dailyRevenue,
      totalRevenue: weekRevenue,
      assistants: assistantsList,
      recentActivity: activityItems.slice(0, 5).map((a) => ({
        ...a,
        timeAgo: getRelativeTime(a.timestamp),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
