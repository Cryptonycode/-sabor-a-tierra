export interface AdminDashboardRecentOrder {
  id: string;
  order_number: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface AdminDashboardRecentApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
}

export interface AdminDashboardStats {
  total_products: number;
  total_orders: number;
  total_customers: number;
  total_farmers: number;
  pending_applications: number;
  total_revenue: number;
  pending_orders: number;
  low_stock_products: number;
  recent_orders: AdminDashboardRecentOrder[];
  recent_applications: AdminDashboardRecentApplication[];
}
