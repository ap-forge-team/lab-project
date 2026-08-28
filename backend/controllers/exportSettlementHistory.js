import ExcelJS from "exceljs";
import Booking from "../models/Booking.js";

export const exportSettlementHistory = async (req, res) => {

  try {

    const history = await Booking.aggregate([

      {
        $match: {
          paymentStatus: "Paid",
          settlementBatchId: {
            $nin: [null, ""]
          }
        }
      },

      {
        $group: {

          _id: "$settlementBatchId",

          batchId: {
            $first: "$settlementBatchId"
          },

          totalBookings: {
            $sum: 1
          },

          totalAmount: {
            $sum: "$paymentAmount"
          },

          labShare: {
            $sum: "$labShare"
          },

          commission: {
            $sum: "$systemCommission"
          },

          utr: {
            $first: "$settlementUTR"
          },

          bankName: {
            $first: "$bankName"
          },

          status: {
            $first: "$labPaymentStatus"
          },

          paidDate: {
            $first: "$labPaidAt"
          },

          labOwner: {
            $first: "$labOwner"
          }

        }

      },

      {
        $lookup: {
          from: "users",
          localField: "labOwner",
          foreignField: "_id",
          as: "labOwner"
        }
      },

      {
        $unwind: {
          path: "$labOwner",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $sort: {
          paidDate: -1
        }
      }

    ]);

    const workbook = new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Settlement History");

    worksheet.columns = [

      {
        header: "Batch ID",
        key: "batchId",
        width: 22
      },

      {
        header: "Lab Owner",
        key: "lab",
        width: 25
      },

      {
        header: "Bookings",
        key: "bookings",
        width: 12
      },

      {
        header: "Total Amount",
        key: "amount",
        width: 15
      },

      {
        header: "Lab Share",
        key: "labShare",
        width: 15
      },

      {
        header: "Commission",
        key: "commission",
        width: 15
      },

      {
        header: "Bank",
        key: "bank",
        width: 20
      },

      {
        header: "UTR",
        key: "utr",
        width: 22
      },

      {
        header: "Status",
        key: "status",
        width: 15
      },

      {
        header: "Paid Date",
        key: "date",
        width: 20
      }

    ];

    history.forEach(item => {

      worksheet.addRow({

        batchId: item.batchId,

        lab: item.labOwner?.name || "-",

        bookings: item.totalBookings,

        amount: item.totalAmount,

        labShare: item.labShare,

        commission: item.commission,

        bank: item.bankName,

        utr: item.utr,

        status: item.status,

        date: item.paidDate
          ? new Date(item.paidDate).toLocaleDateString("en-GB")
          : "-"

      });

    });

    worksheet.getRow(1).font = {
      bold: true
    };

    worksheet.columns.forEach(column => {

      let maxLength = 15;

      column.eachCell?.({ includeEmpty: true }, cell => {

        maxLength = Math.max(
          maxLength,
          String(cell.value || "").length + 2
        );

      });

      column.width = maxLength;

    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=SettlementHistory.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

export const exportLabSettlementHistory = async (req, res) => {

    try {

        const {
            status,
            from,
            to,
            batchId
        } = req.query;

        const filter = {

            labOwner: req.user._id,

            settlementBatchId: {
                $ne: ""
            }

        };

        if (status) {
            filter.labPaymentStatus = status;
        }

        if (batchId) {
            filter.settlementBatchId = batchId;
        }

        if (from || to) {

            filter.labPaidAt = {};

            if (from) {
                filter.labPaidAt.$gte = new Date(from);
            }

            if (to) {

                const endDate = new Date(to);

                endDate.setHours(
                    23,
                    59,
                    59,
                    999
                );

                filter.labPaidAt.$lte = endDate;

            }

        }

        const bookings = await Booking.find(filter)
            .populate("user", "name")
            .populate("test", "title")
            .populate("package", "title")
            .sort({
                labPaidAt: -1
            });

        const workbook = new ExcelJS.Workbook();

        const worksheet =
            workbook.addWorksheet(
                "Settlement History"
            );

        worksheet.columns = [

            {
                header: "Batch ID",
                key: "batchId",
                width: 22
            },

            {
                header: "Patient",
                key: "patient",
                width: 25
            },

            {
                header: "Test / Package",
                key: "service",
                width: 30
            },

            {
                header: "Booking Amount",
                key: "bookingAmount",
                width: 18
            },

            {
                header: "Commission %",
                key: "commissionPercent",
                width: 15
            },

            {
                header: "System Commission",
                key: "commission",
                width: 18
            },

            {
                header: "Lab Share",
                key: "labShare",
                width: 18
            },

            {
                header: "UTR",
                key: "utr",
                width: 28
            },

            {
                header: "Status",
                key: "status",
                width: 18
            },

            {
                header: "Settlement Date",
                key: "date",
                width: 22
            }

        ];

        bookings.forEach((booking) => {

            worksheet.addRow({

                batchId:
                    booking.settlementBatchId,

                patient:
                    booking.user?.name,

                service:
                    booking.test?.title ||
                    booking.package?.title,

                bookingAmount:
                    booking.paymentAmount,

                commissionPercent:
                    booking.commissionValue +
                    (
                        booking.commissionType === "Percentage"
                            ? "%"
                            : ""
                    ),

                commission:
                    booking.systemCommission,

                labShare:
                    booking.labShare,

                utr:
                    booking.settlementUTR,

                status:
                    booking.labPaymentStatus,

                date:
                    booking.labPaidAt
                        ? booking.labPaidAt.toLocaleString()
                        : ""

            });

        });

        worksheet.getRow(1).font = {
            bold: true
        };

        worksheet.columns.forEach(column => {

            let maxLength = 15;

            column.eachCell({
                includeEmpty: true
            }, cell => {

                const length =
                    cell.value
                        ? cell.value.toString().length
                        : 10;

                if (length > maxLength) {

                    maxLength = length;

                }

            });

            column.width = maxLength + 3;

        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=LabSettlementHistory.xlsx"
        );

        await workbook.xlsx.write(res);

        res.end();

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
