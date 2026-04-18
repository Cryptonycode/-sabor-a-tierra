export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface CheckoutPayload {
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  customer_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  delivery_address: {
    address: string;
    city: string;
    postal_code: string;
    province: string;
    delivery_notes?: string;
  };
  payment_method: 'bizum' | 'transferencia';
  marketing_consent: boolean;
  discountCode?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string | null;
  farmer_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

export interface OrderTimelineEntry {
  id: string;
  order_id: string;
  status: string;
  notes?: string | null;
  created_at: string;
  created_by?: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone?: string | null;
  customer_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_province: string;
  shipping_notes?: string | null;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  delivery_notes?: string | null;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  status: OrderStatus;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  tracking_number?: string | null;
  estimated_delivery_date?: string | null;
  estimated_delivery?: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  timeline: OrderTimelineEntry[];
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  [key: string]: unknown;
}

export interface CreateOrderResponse extends ApiSuccessResponse<'order'> {
  order: Order;
}

export interface GetOrderResponse extends ApiSuccessResponse<'order'> {
  order: Order;
}

export interface GetOrdersResponse extends ApiSuccessResponse<'orders'> {
  orders: Order[];
  pagination?: OrdersPagination;
}
