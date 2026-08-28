const categoryUpload = (req, res, next) => {

  upload.fields([
    console.log("req.files 1", req.files),
    {
      name: "icon",
      maxCount: 1,
    },
    {
      name: "illustration",
      maxCount: 1,
    },
  ])(
    req,
    res,
    (error) => {

      if (error) {

        console.error(
          "========== CATEGORY UPLOAD ERROR =========="
        );

        console.error(
          "Name:",
          error.name
        );

        console.error(
          "Message:",
          error.message
        );

        console.error(
          "Code:",
          error.code
        );

        console.error(
          "Full Error:",
          error
        );

        console.error(
          "==========================================="
        );

        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      next();
    }
  );
};

export default categoryUpload;
