const MESSAGES = {
  // ─── General ──────────────────────────────────────
  SERVER_ERROR: "Server Error",
  ALL_FIELDS_REQUIRED: "All Fields Are Required",
  NOT_FOUND: "Not Found",
  UNAUTHORIZED: "Unauthorized",
  ACCESS_DENIED: "Access Denied",
  NO_TOKEN: "No Token",
  NOT_AUTHORIZED: "Not Authorized",
  ROUTE_NOT_FOUND: "Route Not Found",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  TOO_MANY_REQUESTS: "Too many requests, please try again later",
  TOO_MANY_AUTH_ATTEMPTS: "Too many auth attempts, please try again later",
  BACKEND_RUNNING: "Backend Running Successfully",
  INVALID_ACTION: "Invalid Action",

  // ─── Auth ─────────────────────────────────────────
  AUTH: {
    FILL_ALL_FIELDS: "Please fill all fields",
    INVALID_EMAIL_FORMAT: "Invalid email format",
    PHONE_MUST_BE_10_DIGITS: "Phone number must be 10 digits",
    PASSWORD_MIN_6: "Password must be at least 6 characters",
    USER_OR_PHONE_EXISTS: "User or phone number already exists",
    INVALID_CREDENTIALS: "Invalid Credentials",
    USER_NOT_FOUND: "User Not Found",
    EMAIL_REQUIRED: "Email is required",
    OTP_SENT: "OTP Sent Successfully",
    EMAIL_AND_OTP_REQUIRED: "Email and OTP are required",
    INVALID_OTP: "Invalid OTP",
    OTP_EXPIRED: "OTP Expired",
    OTP_VERIFIED: "OTP Verified",
    EMAIL_OTP_PASSWORD_REQUIRED: "Email, OTP and password are required",
    PASSWORD_UPDATED: "Password Updated",
  },

  // ─── User ─────────────────────────────────────────
  USER: {
    NOT_FOUND: "User Not Found",
    UPDATED: "User Updated Successfully",
    DELETED: "User Deleted Successfully",
    ALL_FIELDS_REQUIRED: "All Fields Are Required",
    PASSWORD_MIN_6: "Password Must Be At Least 6 Characters",
    INVALID_EMAIL_FORMAT: "Invalid Email Format",
    ALREADY_EXISTS: "User already exists",
    PHONE_EXISTS: "Phone number already exists",
    ALREADY_EXISTS_CAP: "User Already Exists",
    PHONE_EXISTS_CAP: "Phone Number Already Exists",
  },

  // ─── Admin ────────────────────────────────────────
  ADMIN: {
    LAB_ASSISTANT_CREATED: "Lab Assistant Created Successfully",
    LAB_OWNER_CREATED: "Lab Owner Created Successfully",
  },

  // ─── Booking ──────────────────────────────────────
  BOOKING: {
    PATIENT_NAME_MIN_3: "Patient Name Must Be At Least 3 Characters",
    AGE_BETWEEN_1_99: "Age Must Be Between 1 and 99",
    VALID_PHONE: "Enter Valid 10 Digit Phone Number",
    VALID_PINCODE: "Enter Valid 6 Digit Pincode",
    DATE_NOT_PAST: "Booking Date Cannot Be In Past",
    INVALID_GENDER: "Invalid Gender Selected",
    NO_LAB_AVAILABLE: "No Lab Available",
    NO_LAB_IN_AREA: "No Lab Available In Your Area",
    NOT_FOUND: "Booking Not Found",
    NO_FILE_UPLOADED: "No File Uploaded",
    REPORT_UPLOADED: "Report Uploaded Successfully",
    ASSISTANT_INVALID: "Invalid Assistant",
    ASSISTANT_NOT_BELONG: "Assistant Does Not Belong To Your Lab",
    ASSISTANT_ASSIGNED: "Assistant Assigned Successfully",
    REACHED_PATIENT: "Assistant Reached Patient Home",
    UPLOAD_SAMPLE_IMAGE: "Please upload at least one sample image",
    SAMPLE_UPLOADED: "Sample Uploaded Successfully",
    PAYMENT_RECEIPT_REQUIRED: "Please upload payment receipt.",
    COMMISSION_NOT_FOUND: "Commission setting not found.",
    PAYMENT_COMPLETED: "Payment completed successfully.",
    CANCELLATION_REASON_REQUIRED: "Cancellation reason is required",
    CANNOT_CANCEL_COMPLETED: "Completed booking cannot be cancelled",
    CANCELLED: "Booking Cancelled Successfully",
    CANNOT_MODIFY_COMPLETED: "Completed booking cannot be modified",
    CANCELLATION_REASON_NEEDED: "Cancellation reason required",
    NEW_DATE_TIME_REQUIRED: "New Date and Time Required",
    RESCHEDULED: "Booking Rescheduled Successfully",
    LAB_OWNER_NOT_FOUND: "Lab Owner Not Found",
    LAB_ASSIGNED: "Lab Assigned Successfully",
    TEST_IDS_REQUIRED: "Please provide at least one test ID or package ID",
    TESTS_REACHED_STATUS: "Tests/Packages can only be added when status is Reached",
    INVALID_TEST_IDS: "One or more test IDs are invalid",
    INVALID_PACKAGE_IDS: "One or more package IDs are invalid",
    TESTS_ADDED: "Tests/Packages added successfully",
  },

  // ─── Category ─────────────────────────────────────
  CATEGORY: {
    NAME_REQUIRED: "Category name is required",
    ALREADY_EXISTS: "Category already exists",
    CREATED: "Category created successfully",
    NOT_FOUND: "Category not found",
    DUPLICATE_NAME: "Another category with this name already exists",
    UPDATED: "Category updated successfully",
    CANNOT_DELETE_ASSIGNED: (count) =>
      `Cannot delete this category because ${count} test(s) are assigned to it.`,
    DELETED: "Category deleted successfully",
    ACTIVATED: "Category activated",
    DEACTIVATED: "Category deactivated",
    CANNOT_USE_INACTIVE: "Cannot use an inactive category. Please activate it first.",
  },

  // ─── Subcategory ──────────────────────────────────
  SUBCATEGORY: {
    CATEGORY_REQUIRED: "Category is required",
    NAME_REQUIRED: "Subcategory name is required",
    ALREADY_EXISTS: "Subcategory already exists in this category",
    CREATED: "Subcategory created successfully",
    NOT_FOUND: "Subcategory not found",
    UPDATED: "Subcategory updated successfully",
    CANNOT_DELETE_ASSIGNED: (count) =>
      `Cannot delete this subcategory because ${count} test(s) are assigned to it.`,
    DELETED: "Subcategory deleted successfully",
    ACTIVATED: "Subcategory activated",
    DEACTIVATED: "Subcategory deactivated",
  },

  // ─── Test ─────────────────────────────────────────
  TEST: {
    TITLE_REQUIRED: "Test title is required",
    CATEGORY_REQUIRED: "Category is required",
    VALID_PRICE_REQUIRED: "Valid test price is required",
    SUBCATEGORY_NOT_FOUND: "Subcategory not found",
    SUBCATEGORY_BELONGS_TO_CATEGORY:
      "Selected subcategory does not belong to selected category",
    ALREADY_EXISTS: "Test already exists",
    CREATED: "Test created successfully",
    NOT_FOUND: "Test not found",
    TITLE_EXISTS: "Test title already exists",
    UPDATED: "Test updated successfully",
    DELETED: "Test deleted successfully",
  },

  // ─── Package ──────────────────────────────────────
  PACKAGE: {
    TITLE_REQUIRED: "Package title is required",
    CATEGORY_REQUIRED: "Category is required",
    VALID_PRICE_REQUIRED: "Valid package price is required",
    MIN_ONE_TEST: "Package must contain at least one test",
    ALREADY_EXISTS: "Package already exists",
    INVALID_TESTS: "One or more selected tests are invalid",
    CREATED: "Package created successfully",
    NOT_FOUND: "Package not found",
    TITLE_EMPTY: "Package title cannot be empty",
    TITLE_EXISTS: "Package title already exists",
    UPDATED: "Package updated successfully",
    DELETED: "Package deleted successfully",
    ACTIVATED: "Package activated",
    DEACTIVATED: "Package deactivated",
  },

  // ─── Role ─────────────────────────────────────────
  ROLE: {
    NAME_DISPLAY_NAME_REQUIRED: "Name and display name are required",
    ALREADY_EXISTS: "Role already exists",
    CREATED: "Role created successfully",
    NOT_FOUND: "Role not found",
    UPDATED: "Role updated successfully",
    CANNOT_DELETE_SYSTEM: "Cannot delete system role",
    CANNOT_DELETE_ASSIGNED: (count) =>
      `Cannot delete role. ${count} user(s) assigned to this role.`,
    DELETED: "Role deleted successfully",
    PERMISSIONS_OBJECT_REQUIRED: "Permissions object is required",
    PERMISSIONS_UPDATED: "Permissions updated successfully",
    USER_ID_ROLE_NAME_REQUIRED: "userId and roleName are required",
    ASSIGNED: (roleName, userName) =>
      `Role "${roleName}" assigned to ${userName}`,
    CANNOT_MODIFY_ADMIN: "Admin role permissions cannot be modified by anyone",
  },

  // ─── Commission ───────────────────────────────────
  COMMISSION: {
    TYPE_VALUE_REQUIRED: "Commission Type and Value are required.",
    ALREADY_EXISTS: "Commission already exists. Please update it.",
    CREATED: "Commission created successfully.",
    NOT_FOUND: "Commission not found.",
    UPDATED: "Commission Updated Successfully",
    DELETED: "Commission deleted successfully.",
  },

  // ─── Payment ──────────────────────────────────────
  PAYMENT: {
    SETTING_EXISTS: "Payment setting already exists. Please update it.",
    SETTING_CREATED: "Payment setting created successfully.",
    SETTING_NOT_FOUND: "Payment setting not found.",
    SETTING_UPDATED: "Payment setting updated successfully.",
    SETTING_DELETED: "Payment setting deleted.",
  },

  // ─── Settlement ───────────────────────────────────
  SETTLEMENT: {
    BOOKING_NOT_FOUND: "Booking not found.",
    CUSTOMER_PAYMENT_PENDING: "Customer payment is pending.",
    ALREADY_PROCESSED: "Settlement already processed.",
    UTR_REQUIRED: "UTR Number is required.",
    BANK_NAME_REQUIRED: "Bank Name is required.",
    UTR_EXISTS: "This UTR already exists.",
    SENT: "Settlement sent successfully.",
    NOT_FOUND: "Settlement not found.",
    LAB_OWNER_REQUIRED: "Lab Owner is required.",
    SELECT_BOOKINGS: "Please select bookings.",
    DIFFERENT_LABS: "Selected bookings belong to different labs.",
    NO_PENDING: "No pending settlements found.",
    SENT_SUCCESS: "Settlement Sent Successfully",
    NOT_READY_VERIFY: "Settlement is not ready for verification.",
    VERIFIED: "Settlement verified successfully.",
    VERIFIED_SUCCESS: "Settlement Verified Successfully",
  },

  // ─── Report ───────────────────────────────────────
  REPORT: {
    INVALID: "Invalid Report",
  },
};

export default MESSAGES;
