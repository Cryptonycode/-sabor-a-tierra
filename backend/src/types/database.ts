// ========================================
// TIPOS DE DATOS PARA SUPABASE - ESQUEMA COMPLETO
// ========================================

// 1. USUARIOS CLIENTES
export interface Customer {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  default_shipping_address?: string;
  default_shipping_city?: string;
  default_shipping_postal_code?: string;
  default_shipping_province?: string;
  email_verified: boolean;
  newsletter_subscribed: boolean;
  marketing_emails: boolean;
  google_id?: string;
  facebook_id?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// 2. ADMINISTRADORES
export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'superadmin' | 'admin' | 'moderator';
  permissions: string[];
  is_active: boolean;
  last_login_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// 3. AGRICULTORES
export interface Farmer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  business_name?: string;
  description?: string;
  short_description?: string;
  story?: string;
  address: string;
  city: string;
  postal_code: string;
  province: string;
  coordinates?: string;
  specialties: string[];
  certifications: string[];
  production_type: 'traditional' | 'organic' | 'biodynamic' | 'integrated' | 'artisanal';
  years_experience: number;
  hectares: number;
  customers_served: number;
  profile_image_url?: string;
  cover_image_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verified: boolean;
  website?: string;
  social_media?: any;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// 4. PRODUCTOS
export interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  price: number;
  price_per_kg?: number;
  price_per_box?: number;
  farmer_id: string;
  category: string;
  subcategory?: string;
  tags: string[];
  unit: 'kg' | 'caja' | 'litro' | 'unidad';
  seasonality?: string;
  nutritional_info?: string;
  storage_instructions?: string;
  features: string[];
  is_available: boolean;
  stock_quantity: number;
  min_order_quantity: number;
  max_order_quantity?: number;
  main_image_url: string;
  gallery_images: string[];
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  weight_per_unit?: number;
  requires_cold_shipping: boolean;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// 4.1 VARIANTES DE PRODUCTOS
export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  sku?: string;
  weight?: number;
  unit?: string;
  pieces?: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Producto con variantes
export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

// 5. ÓRDENES
export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_province: string;
  shipping_notes?: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_method?: string;
  payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  payment_reference?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  delivered_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 6. ITEMS DE ORDEN
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_description?: string;
  product_image_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  farmer_name: string;
  farmer_id: string;
  created_at: string;
  updated_at: string;
}

// 7. SUSCRIPCIONES NEWSLETTER
export interface NewsletterSubscription {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  interests: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  confirmed: boolean;
  confirmation_token?: string;
  customer_id?: string;
  subscribed_at: string;
  confirmed_at?: string;
  unsubscribed_at?: string;
  last_email_sent_at?: string;
  created_at: string;
  updated_at: string;
}

// 8. APLICACIONES DE AGRICULTORES
export interface FarmerApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  business_name?: string;
  production_type: string;
  main_products: string;
  certifications?: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
  description?: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  farmer_id?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// TIPOS PARA REQUESTS Y RESPONSES
// ========================================

// Crear orden
export interface CreateOrderRequest {
  customer_id?: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_province: string;
  shipping_notes?: string;
  shipping_cost: number;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

// Crear cliente
export interface CreateCustomerRequest {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  marketing_emails?: boolean;
}

// Crear producto
export interface CreateProductRequest {
  name: string;
  description: string;
  short_description?: string;
  price: number;
  price_per_kg?: number;
  price_per_box?: number;
  farmer_id: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  unit: string;
  seasonality?: string;
  nutritional_info?: string;
  storage_instructions?: string;
  features?: string[];
  stock_quantity?: number;
  min_order_quantity?: number;
  max_order_quantity?: number;
  main_image_url: string;
  gallery_images?: string[];
  weight_per_unit?: number;
  requires_cold_shipping?: boolean;
}

// Crear agricultor
export interface CreateFarmerRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  business_name?: string;
  description?: string;
  short_description?: string;
  story?: string;
  address: string;
  city: string;
  postal_code: string;
  province: string;
  coordinates?: string;
  specialties?: string[];
  certifications?: string[];
  production_type: string;
  years_experience?: number;
  hectares?: number;
  profile_image_url?: string;
  cover_image_url?: string;
  website?: string;
}

// 8. APLICACIONES DE AGRICULTORES
export interface FarmerApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  business_name?: string;
  production_type: 'organic' | 'conventional' | 'integrated';
  main_products: string;
  certifications?: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
  farming_experience: number;
  hectares?: number;
  description: string;
  website?: string;
  social_media?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// Suscripción newsletter
export interface NewsletterSubscriptionRequest {
  email: string;
  first_name?: string;
  last_name?: string;
  interests?: string[];
  frequency?: string;
}

// Respuestas con relaciones
export interface OrderWithItems extends Order {
  order_items: (OrderItem & { product?: Product; farmer?: Farmer })[];
}

export interface ProductWithFarmer extends Product {
  farmer?: Farmer;
}

export interface FarmerWithProducts extends Farmer {
  products?: Product[];
}

// Estadísticas del dashboard
export interface DashboardStats {
  total_customers: number;
  total_farmers: number;
  total_products: number;
  total_orders: number;
  pending_applications: number;
  revenue_this_month: number;
  orders_this_month: number;
}
