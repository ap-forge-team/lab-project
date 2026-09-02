import Booking from "../models/Booking.js";

export const getLabOwnerPaymentStats = async (req, res) => {
  try {

    const bookings = await Booking.find({
      labOwner: req.user._id,
      paymentStatus: "Paid"
    })
    .populate("test", "price")
    .populate("package", "price");

    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;
    let testRevenue = 0;
    let packageRevenue = 0;

    const today = new Date();

    bookings.forEach((booking) => {

      const amount =
        booking.test?.price ||
        booking.package?.price ||
        0;

      totalRevenue += amount;

      if (booking.test)
        testRevenue += amount;

      if (booking.package)
        packageRevenue += amount;

      if (booking.paidAt) {

        const paidDate =
          new Date(booking.paidAt);

        if (
          paidDate.toDateString() ===
          today.toDateString()
        ) {
          todayRevenue += amount;
        }

        if (
          paidDate.getMonth() === today.getMonth() &&
          paidDate.getFullYear() === today.getFullYear()
        ) {
          monthRevenue += amount;
        }
      }
    });

    const pendingPayments =
      await Booking.countDocuments({
        labOwner: req.user._id,
        paymentStatus: "Pending"
      });

    res.json({

      totalRevenue,

      todayRevenue,

      monthRevenue,

      totalPaidBookings: bookings.length,

      pendingPayments,

      testRevenue,

      packageRevenue

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


export const getAdminPayments = async (req, res) => {
  try {
    const { status, method, search, page = 1, limit = 50 } = req.query
    const filter = {}
    if (status) filter.paymentStatus = status
    if (method) filter.paymentMethod = method
    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { patientName: { $regex: search, $options: 'i' } },
      ]
    }
    const skip = (Number(page) - 1) * Number(limit)
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('test', 'title price')
        .populate('package', 'title price')
        .populate('labOwner', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ])
    res.json({ data: bookings, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAdminPaymentStats = async (req, res) => {

  try {

    const bookings =
      await Booking.find({
        paymentStatus: "Paid"
      })
      .populate("test","price")
      .populate("package","price");

    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;

    const today = new Date();

    bookings.forEach((booking)=>{

      const amount =
        booking.test?.price ||
        booking.package?.price ||
        0;

      totalRevenue += amount;

      if (booking.paidAt) {

        const paidDate =
          new Date(booking.paidAt);

        if (
          paidDate.toDateString() ===
          today.toDateString()
        ) {
          todayRevenue += amount;
        }

        if (
          paidDate.getMonth() === today.getMonth() &&
          paidDate.getFullYear() === today.getFullYear()
        ) {
          monthRevenue += amount;
        }
      }

    });

    const pendingPayments =
      await Booking.countDocuments({
        paymentStatus:"Pending"
      });

    res.json({

      totalRevenue,

      todayRevenue,

      monthRevenue,

      totalPaidBookings:
        bookings.length,

      pendingPayments

    });

  } catch(error){

    res.status(500).json({
      message:error.message
    });

  }

}
