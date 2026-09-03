import Booking from "../models/Booking.js";
import Test from "../models/Test.js";
import Package from "../models/Package.js";
import User from "../models/User.js";

export const getAdminDashboardStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
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

    const [
      totalBookings,
      totalBookingsLast7,
      totalBookingsPrev7,
      totalTests,
      totalTestsLast7,
      totalTestsPrev7,
      activeLabOwners,
      activeLabOwnersLast7,
      activeLabOwnersPrev7,
      totalUsers,
      totalUsersLast7,
      totalUsersPrev7,
      allBookings,
      recentBookings,
      allPaidBookings,
      packageDocs,
    ] = await Promise.all([
      Booking.countDocuments(dateFilter),
      Booking.countDocuments({ createdAt: { $gte: sevenDaysAgo, $lte: now }, ...dateFilter }),
      Booking.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      Test.countDocuments(dateFilter),
      Test.countDocuments({ createdAt: { $gte: sevenDaysAgo, $lte: now }, ...dateFilter }),
      Test.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      User.countDocuments({ role: "lab_owner", ...dateFilter }),
      User.countDocuments({ role: "lab_owner", createdAt: { $gte: sevenDaysAgo, $lte: now }, ...dateFilter }),
      User.countDocuments({ role: "lab_owner", createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      User.countDocuments(dateFilter),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo, $lte: now }, ...dateFilter }),
      User.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      Booking.find(dateFilter)
        .populate("test", "title price")
        .populate("package", "title price")
        .populate("labOwner", "name")
        .sort({ createdAt: -1 }),
      Booking.find(dateFilter)
        .populate("test", "title price")
        .populate("package", "title price")
        .sort({ createdAt: -1 })
        .limit(5),
      Booking.find({ paymentStatus: "Paid", ...dateFilter })
        .populate("test", "title price")
        .populate("package", "title price")
        .sort({ createdAt: -1 })
        .limit(5),
      Package.find(dateFilter).populate("testsIncluded", "title"),
    ]);

    const totalRevenue = allBookings.reduce((sum, b) => {
      if (b.paymentStatus === "Paid") {
        return sum + (b.totalAmount || b.paymentAmount || b.test?.price || b.package?.price || 0);
      }
      return sum;
    }, 0);

    const prevTotalRevenue = 0;

    const calcTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
      totalBookings,
      totalBookingsTrend: calcTrend(totalBookingsLast7, totalBookingsPrev7),
      totalTests,
      totalTestsTrend: calcTrend(totalTestsLast7, totalTestsPrev7),
      totalRevenue,
      totalRevenueTrend: 16,
      activeLabOwners,
      activeLabOwnersTrend: calcTrend(activeLabOwnersLast7, activeLabOwnersPrev7),
      totalUsers,
      totalUsersTrend: calcTrend(totalUsersLast7, totalUsersPrev7),
    };

    const recentBookingsList = recentBookings.map((b) => ({
      _id: b._id,
      bookingId: b.reportId || b._id.toString().slice(-8).toUpperCase(),
      patientName: b.patientName,
      testName: b.test?.title || b.package?.title || "N/A",
      status: b.status,
      createdAt: b.createdAt,
    }));

    const recentPayments = allPaidBookings.map((b) => ({
      _id: b._id,
      paymentId: b.transactionId || b._id.toString().slice(-8).toUpperCase(),
      patientName: b.patientName,
      amount: b.totalAmount || b.paymentAmount || b.test?.price || b.package?.price || 0,
      status: b.paymentStatus,
      createdAt: b.createdAt,
    }));

    const testBookingMap = {};
    allBookings.forEach((b) => {
      const testId = b.test?._id?.toString();
      if (testId && b.test?.title) {
        if (!testBookingMap[testId]) {
          testBookingMap[testId] = { title: b.test.title, bookings: 0, revenue: 0 };
        }
        testBookingMap[testId].bookings += 1;
        if (b.paymentStatus === "Paid") {
          testBookingMap[testId].revenue += b.totalAmount || b.paymentAmount || b.test?.price || 0;
        }
      }
    });
    const topTests = Object.values(testBookingMap)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    const packageBookingMap = {};
    allBookings.forEach((b) => {
      const packageId = b.package?._id?.toString();
      if (packageId && b.package?.title) {
        if (!packageBookingMap[packageId]) {
          packageBookingMap[packageId] = { title: b.package.title, bookings: 0, revenue: 0 };
        }
        packageBookingMap[packageId].bookings += 1;
        if (b.paymentStatus === "Paid") {
          packageBookingMap[packageId].revenue += b.totalAmount || b.paymentAmount || b.package?.price || 0;
        }
      }
    });
    const topPackages = Object.values(packageBookingMap)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    const labOwnerMap = {};
    allBookings.forEach((b) => {
      const ownerId = b.labOwner?._id?.toString();
      if (ownerId && b.labOwner?.name) {
        if (!labOwnerMap[ownerId]) {
          labOwnerMap[ownerId] = { name: b.labOwner.name, bookings: 0, completed: 0 };
        }
        labOwnerMap[ownerId].bookings += 1;
        if (b.status === "Completed") labOwnerMap[ownerId].completed += 1;
      }
    });
    const topLabOwners = Object.values(labOwnerMap)
      .map((lo) => ({
        ...lo,
        rating: lo.bookings > 0 ? Math.min(5, 3.5 + (lo.completed / lo.bookings) * 1.5).toFixed(1) : "0.0",
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    const bookingStatusCounts = { Completed: 0, Pending: 0, Processing: 0, Cancelled: 0, Assigned: 0, Reached: 0, "Sample Collected": 0 };
    allBookings.forEach((b) => {
      if (bookingStatusCounts[b.status] !== undefined) {
        bookingStatusCounts[b.status] += 1;
      } else {
        bookingStatusCounts.Processing += 1;
      }
    });

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
      });
    }

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthlyRevenue = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i);
      const dayStr = d.toISOString().slice(0, 10);
      const dayRevenue = allBookings
        .filter((b) => {
          const bDate = new Date(b.createdAt).toISOString().slice(0, 10);
          return bDate === dayStr && b.paymentStatus === "Paid";
        })
        .reduce((sum, b) => sum + (b.totalAmount || b.paymentAmount || b.test?.price || b.package?.price || 0), 0);
      monthlyRevenue.push({
        date: `${String(i).padStart(2, "0")} ${d.toLocaleDateString("en-IN", { month: "short" })}`,
        revenue: dayRevenue,
      });
    }

    const paymentMethodMap = { UPI: 0, Card: 0, "Net Banking": 0, Cash: 0, Online: 0 };
    allBookings.forEach((b) => {
      if (b.paymentStatus === "Paid") {
        const method = b.paymentMethod || "Cash";
        if (paymentMethodMap[method] !== undefined) {
          paymentMethodMap[method] += b.totalAmount || b.paymentAmount || 0;
        } else {
          paymentMethodMap.Cash += b.totalAmount || b.paymentAmount || 0;
        }
      }
    });

    const totalPaidAmount = Object.values(paymentMethodMap).reduce((a, b) => a + b, 0);

    const paymentMethods = Object.entries(paymentMethodMap)
      .map(([method, amount]) => ({
        method,
        amount,
        percentage: totalPaidAmount > 0 ? ((amount / totalPaidAmount) * 100).toFixed(1) : 0,
      }))
      .filter((m) => m.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const activityItems = [];
    recentBookings.slice(0, 3).forEach((b) => {
      activityItems.push({
        type: "booking",
        title: "New booking received",
        description: `Booking ${b.bookingId} for ${b.testName}`,
        timestamp: b.createdAt,
      });
    });

    const recentPaid = allPaidBookings.slice(0, 2);
    recentPaid.forEach((b) => {
      activityItems.push({
        type: "payment",
        title: "Payment received",
        description: `Payment of ₹${(b.totalAmount || b.paymentAmount || 0).toLocaleString("en-IN")} from ${b.patientName}`,
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

    res.json({
      stats,
      recentBookings: recentBookingsList,
      recentPayments,
      topTests,
      topPackages,
      topLabOwners,
      bookingStatusCounts,
      bookingsOverview: last7Days,
      revenueOverview: monthlyRevenue,
      paymentMethods,
      totalPaidAmount,
      recentActivity: activityItems.slice(0, 5).map((a) => ({
        ...a,
        timeAgo: getRelativeTime(a.timestamp),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
