import axiosInstance, {
  API_PREFIX,
  COMMON_PREFIX,
  STATISTICS_PREFIX,
} from "./axios";

// API path constants
const API_PATHS = {
  // Auth endpoints
  login: `${COMMON_PREFIX}/login`,
  verifyOtp: `${COMMON_PREFIX}/verify_otp`,
  resendOtp: `${COMMON_PREFIX}/resend_otp`,

  // Common API endpoints
  common: COMMON_PREFIX,

  // Statistics API endpoints
  outletStatistics: STATISTICS_PREFIX,
  getAllStatsWithoutFilter: `${STATISTICS_PREFIX}/get_all_stats`,
  outletDetails: `${STATISTICS_PREFIX}/outlet_details`,
  outletCompareDetails: `${STATISTICS_PREFIX}/outlet_compare_details`,

  // Reports API endpoints
  orderReport: `${STATISTICS_PREFIX}/order_report`,
  menuReport: `${STATISTICS_PREFIX}/menu_report`,
  customerReport: `${STATISTICS_PREFIX}/customer_report`,
  paymentReport: `${STATISTICS_PREFIX}/payment_report`,
  staffReport: `${STATISTICS_PREFIX}/staff_report`,
  tableReport: `${STATISTICS_PREFIX}/table_report`,
  splitTableReport: `${STATISTICS_PREFIX}/report_split_table`,
  joinTableReport: `${STATISTICS_PREFIX}/report_join_table`,
  orderStatusReport: `${STATISTICS_PREFIX}/report_order_status_changed`,
  paymentSettleReport: `${STATISTICS_PREFIX}/report_order_payment_settle_type_changed`,
  couponReport: `${STATISTICS_PREFIX}/coupon_report`,
  tipReport: `${STATISTICS_PREFIX}/tip_report`,
  chargesReport: `${STATISTICS_PREFIX}/charges_report`,
  specialDiscountReport: `${STATISTICS_PREFIX}/special_discount_report`,
  reportFilterCategory: `${STATISTICS_PREFIX}/report_filter_category`,
  inventoryReport: `${STATISTICS_PREFIX}/inventory_report`,
  reportFilterSupplier: `${STATISTICS_PREFIX}/report_filter_supplier`,
  reportFilterSection: `${STATISTICS_PREFIX}/report_filter_section`,
  udhariReport: `${STATISTICS_PREFIX}/udhari_report`,
};

export const api = axiosInstance;

export { API_PATHS, API_PREFIX, COMMON_PREFIX, STATISTICS_PREFIX };