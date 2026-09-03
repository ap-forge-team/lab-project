import Booking from "../models/Booking.js";
import Test from "../models/Test.js";
import Package from "../models/Package.js";

export const getPatientDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const baseFilter = { user: userId };

    const [
      upcomingBooking,
      reportsAvailable,
      totalBookings,
      completedBookings,
      totalTests,
      recentBookings,
      recommendedTests,
      recommendedPackages,
    ] = await Promise.all([
      Booking.findOne({
        ...baseFilter,
        status: { $in: ["Pending", "Assigned", "Reached"] },
        bookingDate: { $gte: now.toISOString().split("T")[0] },
      })
        .populate("test", "title price")
        .populate("package", "title price")
        .populate("labOwner", "name")
        .sort({ bookingDate: 1, bookingTime: 1 })
        .limit(1),
      Booking.countDocuments({
        ...baseFilter,
        report: { $ne: "" },
        status: "Completed",
      }),
      Booking.countDocuments(baseFilter),
      Booking.countDocuments({ ...baseFilter, status: "Completed" }),
      Booking.distinct("test", baseFilter).then((tests) => tests.filter(Boolean).length),
      Booking.find(baseFilter)
        .populate("test", "title price")
        .populate("package", "title price")
        .populate("labOwner", "name")
        .sort({ createdAt: -1 })
        .limit(5),
      Test.find({ isActive: true })
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .limit(4),
      Package.find({ isActive: true })
        .populate("category", "name")
        .populate("testsIncluded", "title")
        .sort({ createdAt: -1 })
        .limit(4),
    ]);

    const upcomingBookingData = upcomingBooking
      ? {
          _id: upcomingBooking._id,
          bookingId: upcomingBooking.reportId || `BKD-${new Date(upcomingBooking.createdAt).getFullYear()}-${upcomingBooking._id.toString().slice(-4).toUpperCase()}`,
          testName: upcomingBooking.test?.title || upcomingBooking.package?.title || "N/A",
          date: upcomingBooking.bookingDate,
          time: upcomingBooking.bookingTime,
          status: upcomingBooking.status,
          labName: upcomingBooking.labOwner?.name || "N/A",
          address: upcomingBooking.address || "N/A",
          city: upcomingBooking.city || "",
          pincode: upcomingBooking.pincode || "",
        }
      : null;

    const recentBookingsData = recentBookings.map((b) => ({
      _id: b._id,
      bookingId: b.reportId || `BKD-${new Date(b.createdAt).getFullYear()}-${b._id.toString().slice(-4).toUpperCase()}`,
      testName: b.test?.title || b.package?.title || "N/A",
      date: b.bookingDate,
      status: b.status,
      labName: b.labOwner?.name || "N/A",
      amount: b.totalAmount || b.paymentAmount || b.test?.price || b.package?.price || 0,
    }));

    const recommendedTestsData = recommendedTests.map((t) => ({
      _id: t._id,
      title: t.title,
      price: t.price,
      discount: t.discount || 0,
      offerPrice: t.offerPrice || t.price,
      categoryName: t.category?.name || "General",
      testsCount: 1,
    }));

    const recommendedPackagesData = recommendedPackages.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      image: p.image || "",
      testsCount: p.testsIncluded?.length || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          upcomingBooking: upcomingBookingData ? 1 : 0,
          reportsAvailable,
          totalBookings,
          totalTests,
        },
        upcomingBooking: upcomingBookingData,
        recentBookings: recentBookingsData,
        recommendedTests: recommendedTestsData,
        recommendedPackages: recommendedPackagesData,
      },
    });
  } catch (error) {
    console.error("Patient Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};
