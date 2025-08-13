import { api, API_PATHS } from './index';

// Function to fetch order reports
export const getOrderReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.orderReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail && response.data.detail.orders) {
      // Process orders to ensure they have unique IDs for the table
      return response.data.detail.orders.map(order => ({
        ...order,
        id: order.order_id || `order-${Math.random().toString(36).substr(2, 9)}`
      }));
    }
    
    // If the response doesn't have the expected structure, return an empty array
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching order report:', error);
    throw error;
  }
};

// Function to fetch menu reports
export const getMenuReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.menuReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    // The API returns an array directly in the detail field
    if (response.data && response.data.detail && Array.isArray(response.data.detail)) {
      // Process menu items to ensure they have unique IDs for the table
      return response.data.detail.map((item, index) => {
        // Process portions data if available
        let portions = [];
        if (item.portions && Array.isArray(item.portions)) {
          portions = item.portions.map(portion => ({
            ...portion,
            portion_id: portion.portion_id || `portion-${Math.random().toString(36).substr(2, 9)}`
          }));
        }
        
        return {
          ...item,
          id: item.menu_id || `menu-${index}`,
          portions: portions,
          // Ensure all required fields have default values
          menu_name: item.menu_name || 'Unnamed Item',
          category_name: item.category_name || 'Uncategorized',
          price: item.price || 0,
          total_orders: item.total_orders || 0,
          total_quantity: item.total_quantity || 0,
          total_revenue: item.total_revenue || 0
        };
      });
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching menu report:', error);
    throw error;
  }
};

// Function to fetch customer reports
export const getCustomerReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.customerReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    if (response.data && response.data.detail && response.data.detail.customers) {
      return response.data.detail.customers.map(customer => ({
        ...customer,
        id: customer.customer_id || `customer-${Math.random().toString(36).substr(2, 9)}`
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching customer report:', error);
    throw error;
  }
};

// Function to fetch payment reports
export const getPaymentReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.paymentReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    if (response.data && response.data.detail && response.data.detail.payments) {
      return response.data.detail.payments.map(payment => ({
        ...payment,
        id: payment.payment_id || `payment-${Math.random().toString(36).substr(2, 9)}`
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching payment report:', error);
    throw error;
  }
};

// Function to fetch table reports
export const getTableReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.tableReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail && response.data.detail.tables) {
      // Process tables to ensure they have unique IDs
      return response.data.detail.tables.map((table, index) => ({
        ...table,
        id: table.table_id || `table-${index}`,
        // Ensure all required fields have default values
        table_number: table.table_number || `Unknown`,
        section_name: table.section_name || 'Uncategorized',
        capacity: table.capacity || 0,
        is_reserved: table.is_reserved || false,
        is_joined: table.is_joined || false,
        status: table.status || 'Available'
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching table report:', error);
    throw error;
  }
};

// Function to fetch split table reports
export const getSplitTableReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.splitTableReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail && response.data.detail.split_history) {
      // Process split history to ensure they have unique IDs
      return response.data.detail.split_history.map((item, index) => ({
        ...item,
        id: item.split_id || `split-${index}`,
        // Ensure all required fields have default values
        primary_table_number: item.primary_table_number || 'Unknown',
        sub_table_name: item.sub_table_name || 'Unknown',
        section_name: item.section_name || 'Uncategorized',
        status: item.status || 'Unknown',
        changed_by: item.changed_by || 'Unknown',
        changed_on: item.changed_on || 'Unknown'
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching split table report:', error);
    throw error;
  }
};

// Function to fetch join table reports
export const getJoinTableReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.joinTableReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail && response.data.detail.join_history) {
      // Process join history to ensure they have unique IDs
      return response.data.detail.join_history.map((item, index) => ({
        ...item,
        id: item.join_id || `join-${index}`,
        // Ensure all required fields have default values
        primary_table_number: item.primary_table_number || 'Unknown',
        joined_table_number: item.joined_table_number || 'Unknown',
        section_name: item.section_name || 'Uncategorized',
        status: item.status || 'Unknown',
        changed_by: item.changed_by || 'Unknown',
        changed_on: item.changed_on || 'Unknown'
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching join table report:', error);
    throw error;
  }
};

// Function to fetch staff reports
export const getStaffReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.staffReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail) {
      const data = response.data.detail;
      
      // Process operational staff data
      let operationalStaff = [];
      if (data.operational_staff && Array.isArray(data.operational_staff)) {
        operationalStaff = data.operational_staff.map((staff, index) => ({
          ...staff,
          id: staff.staff_id || `op-staff-${index}`,
          type: 'operational'
        }));
      }
      
      // Process non-operational staff data
      let nonOperationalStaff = [];
      if (data.non_operational_staff && Array.isArray(data.non_operational_staff)) {
        nonOperationalStaff = data.non_operational_staff.map((staff, index) => ({
          ...staff,
          id: staff.staff_id || `non-op-staff-${index}`,
          type: 'non-operational'
        }));
      }
      
      // Combine both staff types based on filter_type
      if (params.filter_type === 'operational') {
        return operationalStaff;
      } else if (params.filter_type === 'non-operational') {
        return nonOperationalStaff;
      } else {
        // For 'all' or any other filter type, return both types
        return [...operationalStaff, ...nonOperationalStaff];
      }
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching staff report:', error);
    throw error;
  }
};

// Function to fetch inventory reports
export const getInventoryReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.inventoryReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // For inventory reports, the API returns a nested structure
    if (response.data && response.data.detail) {
      // Extract summary data and inventory items
      const summaryData = response.data.detail.inventory_report || {};
      const inventoryItems = response.data.detail.inventory_items || [];
      
      // Process inventory items to ensure they have unique IDs for the table
      const processedItems = inventoryItems.map((item, index) => ({
        ...item,
        id: item.inventory_id || `inventory-${index}`,
        // Ensure all required fields have default values
        name: item.name || 'Unnamed Item',
        category: item.category || 'Uncategorized',
        quantity: item.quantity || 0,
        unit_of_measure: item.unit_of_measure || 'unit',
        unit_price: item.unit_price || 0,
        // Add supplier name directly to the item for easier display
        supplier_name: item.supplier?.name || 'N/A',
        // Add summary data to each item for reference
        summaryData
      }));
      
      return processedItems;
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    throw error;
  }
};

// Function to fetch order status reports
export const getOrderStatusReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.orderStatusReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail && response.data.detail.status_history) {
      // Process status history to ensure they have unique IDs
      return response.data.detail.status_history.map((item, index) => ({
        ...item,
        id: item.status_id || `status-${index}`,
        // Ensure all required fields have default values
        order_number: item.order_number || 'Unknown',
        order_type: item.order_type || 'Unknown',
        order_status: item.order_status || 'Unknown',
        amount: item.amount || 0,
        user_name: item.user_name || 'Unknown',
        changed_on: item.changed_on || 'Unknown'
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching order status report:', error);
    throw error;
  }
};

// Function to fetch payment settle reports
export const getPaymentSettleReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.paymentSettleReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail && response.data.detail.payment_settle_history) {
      // Process payment settle history to ensure they have unique IDs
      return response.data.detail.payment_settle_history.map((item, index) => ({
        ...item,
        id: item.payment_id || `payment-${index}`,
        // Ensure all required fields have default values
        order_number: item.order_number || 'Unknown',
        order_type: item.order_type || 'Unknown',
        previous_settle_type: item.previous_settle_type || 'None',
        new_settle_type: item.new_settle_type || 'Unknown',
        amount: item.amount || 0,
        changed_by: item.changed_by || 'Unknown',
        changed_on: item.changed_on || 'Unknown'
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching payment settle report:', error);
    throw error;
  }
};

// Function to fetch coupon reports
export const getCouponReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.couponReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail && response.data.detail.coupon_details) {
      // Process coupon details to ensure they have unique IDs
      return response.data.detail.coupon_details.map((item, index) => ({
        ...item,
        id: item.coupon_id || `coupon-${index}`,
        // Ensure all required fields have default values
        order_number: item.order_number || 'Unknown',
        order_type: item.order_type || 'Unknown',
        order_status: item.order_status || 'Unknown',
        coupon_code: item.coupon_code || 'Unknown',
        coupon_type: item.coupon_type || 'Unknown',
        discount_amount: item.discount_amount || 0,
        total_bill_amount: item.total_bill_amount || 0,
        final_grand_total: item.final_grand_total || 0
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching coupon report:', error);
    throw error;
  }
};

// Function to fetch tip reports
export const getTipReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.tipReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail && response.data.detail.tip_orders) {
      // Process tip orders to ensure they have unique IDs
      return response.data.detail.tip_orders.map((item, index) => ({
        ...item,
        id: item.order_id || `tip-${index}`,
        // Ensure all required fields have default values
        order_number: item.order_number || 'Unknown',
        order_type: item.order_type || 'Unknown',
        order_status: item.order_status || 'Unknown',
        payment_method: item.payment_method || 'N/A',
        created_on: item.created_on || 'Unknown',
        tip_amount: item.tip_amount || 0,
        final_grand_total: item.final_grand_total || 0,
        customer_name: item.customer_name || 'N/A',
        customer_mobile: item.customer_mobile || 'N/A'
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching tip report:', error);
    throw error;
  }
};

// Function to fetch service charge reports
export const getChargesReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.chargesReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail && response.data.detail.charges_orders) {
      // Process charges orders to ensure they have unique IDs
      return response.data.detail.charges_orders.map((item, index) => ({
        ...item,
        id: item.order_id || `charges-${index}`,
        // Ensure all required fields have default values
        order_number: item.order_number || 'Unknown',
        order_type: item.order_type || 'Unknown',
        order_status: item.order_status || 'Unknown',
        payment_method: item.payment_method || 'N/A',
        created_on: item.created_on || 'Unknown',
        charges_amount: item.charges_amount || 0,
        final_grand_total: item.final_grand_total || 0,
        customer_name: item.customer_name || 'N/A',
        customer_mobile: item.customer_mobile || 'N/A'
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching charges report:', error);
    throw error;
  }
};

// Function to fetch special discount reports
export const getSpecialDiscountReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.specialDiscountReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail && response.data.detail.discount_orders) {
      // Process discount orders to ensure they have unique IDs
      return response.data.detail.discount_orders.map((item, index) => ({
        ...item,
        id: item.order_id || `discount-${index}`,
        // Ensure all required fields have default values
        order_number: item.order_number || 'Unknown',
        order_type: item.order_type || 'Unknown',
        order_status: item.order_status || 'Unknown',
        payment_method: item.payment_method || 'N/A',
        created_on: item.created_on || 'Unknown',
        special_discount_amount: item.special_discount_amount || 0,
        total_bill_amount: item.total_bill_amount || 0,
        final_grand_total: item.final_grand_total || 0,
        customer_name: item.customer_name || 'N/A',
        customer_mobile: item.customer_mobile || 'N/A'
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching special discount report:', error);
    throw error;
  }
};

// Function to fetch udhari reports
export const getUdhariReport = async (params) => {
  try {
    const response = await api.post(API_PATHS.udhariReport, {
      ...params,
      outlet_id: localStorage.getItem('outlet_id'),
      user_id: localStorage.getItem('user_id')
    });
    
    // Check if response has the expected structure
    if (response.data && response.data.detail && response.data.detail.udhari_ledgers) {
      // Process udhari ledgers to ensure they have unique IDs
      return response.data.detail.udhari_ledgers.map((item, index) => ({
        ...item,
        id: item.ledger_id || `udhari-${index}`,
        // Ensure all required fields have default values
        customer_name: item.customer_name || 'Unknown',
        customer_mobile: item.customer_mobile || 'N/A',
        customer_address: item.customer_address || 'N/A',
        order_number: item.order_number || 'Unknown',
        order_type: item.order_type || 'Unknown',
        order_status: item.order_status || 'Unknown',
        bill_amount: item.bill_amount || 0,
        udhari_datetime: item.udhari_datetime || 'Unknown',
        settle_amount: item.settle_amount || 0,
        settle_datetime: item.settle_datetime || 'N/A',
        pending_amount: item.pending_amount || 0,
        ledger_status: item.ledger_status || 'Unknown',
        estimated_settlement_period: item.estimated_settlement_period || 'N/A'
      }));
    }
    
    console.error('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching udhari report:', error);
    throw error;
  }
}; 