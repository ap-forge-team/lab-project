  import axios from "axios";
  import sha256 from "sha256";
  import uniqid from "uniqid";
  import Booking from "../models/Booking.js";
  import logger from "../Utils/logger.js";

  export const createPayment =
    async (req, res) => {

      try {

        const {
          bookingId,
          patientName,
          amount,
          mobileNumber,
        } = req.body;

        const merchantTransactionId =
          "T" + Date.now();

          await Booking.findByIdAndUpdate( bookingId,
            {
      transactionId:
        merchantTransactionId,
    }
  );

        const data = {

          merchantId:
            process.env.MERCHANT_ID,

          merchantTransactionId,

          merchantUserId:
            bookingId,

          amount:
            Number(amount) * 100,

          redirectUrl:
          //   `http://localhost:5000/api/payment/status/${merchantTransactionId}`,

              `${process.env.BACK_END_URL}/api/payment/status/${merchantTransactionId}`,

          redirectMode: "REDIRECT",

          callbackUrl:
          //   `http://localhost:5000/api/payment/status/${merchantTransactionId}`,
              `${process.env.BACK_END_URL}/api/payment/status/${merchantTransactionId}`,

          mobileNumber:
            mobileNumber ||
            "9999999999",

          paymentInstrument: {
            type: "PAY_PAGE",
          },
        };

        const payload =
          JSON.stringify(data);

        const payloadMain =
          Buffer.from(payload)
            .toString("base64");

        const key =
          payloadMain +
          "/pg/v1/pay" +
          process.env.SALT_KEY;



        const xVerify =
          sha256(key) +
          "###" +
          process.env.SALT_INDEX;
        

        const response =
          await axios.post(

            `${process.env.BASE_URL}/pg/v1/pay`,

            {
              request: payloadMain,
            },

            {
              headers: {

                accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                "X-VERIFY":
                  xVerify,
              },
            }
          );

        logger.info("PhonePe payment response", { data: response.data });

        const phonepeUrl =
          response.data.data
            .instrumentResponse
            .redirectInfo.url;

        return res.status(200)
          .json({

            success: true,

            url: phonepeUrl,
          });

      } catch (error) {

        logger.error("PhonePe payment error", { message: error.message, response: error.response?.data });

        return res.status(500)
          .json({

            success: false,

            error:
              error.response?.data,
          });
      }
    };

  export const checkPaymentStatus = async (req, res) => {
  try {

    const { txnId } = req.params;

    const string =
      `/pg/v1/status/${process.env.MERCHANT_ID}/${txnId}` +
      process.env.SALT_KEY;

    const xVerify =
      sha256(string) +
      "###" +
      process.env.SALT_INDEX;

    const response = await axios.get(
      `${process.env.BASE_URL}/pg/v1/status/${process.env.MERCHANT_ID}/${txnId}`,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-MERCHANT-ID": process.env.MERCHANT_ID,
          "X-VERIFY": xVerify,
        },
      }
    );

    logger.info("PhonePe payment response", { data: response.data });

    const booking = await Booking.findOne({
      transactionId: txnId,
    });

    if (!booking) {
      return res.redirect(
        `${process.env.FRONT_END_URL}/lab-assistant?payment=notfound`
      );
    }

    const paymentState =
      response?.data?.data?.state;

    logger.info("Full PhonePe response", { data: response.data });

    logger.info("PhonePe payment state", { state: response?.data?.data?.state });

    // SUCCESS
    if (paymentState === "COMPLETED") {

      booking.paymentStatus = "Paid";
      booking.paidAt = new Date();

      await booking.save();

      return res.redirect(
 `${process.env.FRONT_END_URL}/lab-assistant?payment=success&t=${Date.now()}`
);
    }
    // FAILED
    if (
      paymentState === "FAILED" ||
      paymentState === "DECLINED"
    ) {

      booking.paymentStatus = "Failed";
      await booking.save();
      return res.redirect(
        `${process.env.FRONT_END_URL}/lab-assistant?payment=failed`
      );
    }

    // PENDING
    booking.paymentStatus = "Pending";
    await booking.save();
    return res.redirect(
      `${process.env.FRONT_END_URL}/lab-assistant?payment=pending`
    );

  } catch (error) {
    logger.error("PhonePe payment error", { message: error.message, response: error.response?.data });
    return res.redirect(
      `${process.env.FRONT_END_URL}/lab-assistant?payment=error`
    );
  }
};
