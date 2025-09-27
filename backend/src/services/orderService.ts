import { supabaseAdmin } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface CreateOrderData {
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
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  marketing_consent: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  delivery_province: string;
  delivery_notes?: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  timeline?: OrderTimeline[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  farmer_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  status: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export class OrderService {
  // Generar número de pedido único
  private static generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    return `ORD-${year}-${timestamp.toString().slice(-6)}`;
  }

  // Calcular fecha estimada de entrega
  private static calculateEstimatedDelivery(): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 días laborables
    return deliveryDate.toISOString();
  }

  // Crear nuevo pedido
  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    const orderId = uuidv4();
    const orderNumber = this.generateOrderNumber();
    const estimatedDelivery = this.calculateEstimatedDelivery();

    try {
      // 1. Crear el pedido principal
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([{
          id: orderId,
          order_number: orderNumber,
          customer_email: orderData.customer_info.email,
          customer_name: `${orderData.customer_info.first_name} ${orderData.customer_info.last_name}`,
          customer_phone: orderData.customer_info.phone,
          delivery_address: orderData.delivery_address.address,
          delivery_city: orderData.delivery_address.city,
          delivery_postal_code: orderData.delivery_address.postal_code,
          delivery_province: orderData.delivery_address.province,
          delivery_notes: orderData.delivery_address.delivery_notes,
          subtotal: orderData.subtotal,
          shipping_cost: orderData.shipping_cost,
          tax_amount: orderData.tax_amount,
          total_amount: orderData.total_amount,
          order_status: 'pending',
          payment_status: orderData.payment_method === 'cash_on_delivery' ? 'pending' : 'paid',
          payment_method: orderData.payment_method,
          estimated_delivery: estimatedDelivery
        }])
        .select()
        .single();

      if (orderError) {
        throw new Error(`Error al crear pedido: ${orderError.message}`);
      }

      // 2. Crear los items del pedido
      const orderItems = [];
      for (const item of orderData.items) {
        // Obtener información del producto
        const { data: product, error: productError } = await supabaseAdmin
          .from('products')
          .select(`
            id, name, main_image_url,
            farmers!farmer_id (first_name, last_name, business_name)
          `)
          .eq('id', item.product_id)
          .single();

        if (productError) {
          console.warn(`Producto no encontrado: ${item.product_id}`);
          continue;
        }

        const farmer = product.farmers as any; // Casting temporal para evitar errores de tipo
        const farmerName = farmer?.business_name || 
          `${farmer?.first_name} ${farmer?.last_name}` || 
          'Agricultor no especificado';

        const orderItem = {
          id: uuidv4(),
          order_id: orderId,
          product_id: item.product_id,
          product_name: product.name,
          product_image: product.main_image_url,
          farmer_name: farmerName,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        };

        orderItems.push(orderItem);
      }

      // Insertar items del pedido
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabaseAdmin
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          throw new Error(`Error al crear items del pedido: ${itemsError.message}`);
        }
      }

      // 3. Crear entrada en timeline
      await this.addTimelineEntry(orderId, 'pending', 'Pedido recibido y en proceso de confirmación');

      // 4. Crear cliente si no existe (simplificado)
      await this.createOrUpdateCustomer(orderData.customer_info, orderData.marketing_consent);

      // 5. Actualizar stock de productos (simplificado)
      for (const item of orderData.items) {
        await this.updateProductStock(item.product_id, item.quantity);
      }

      // Devolver el pedido completo con items
      return await this.getOrderById(orderId) as Order;

    } catch (error) {
      console.error('Error en createOrder:', error);
      throw error;
    }
  }

  // Obtener pedido por ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return null;
      }

      // Obtener items del pedido
      const { data: items, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at');

      // Obtener timeline del pedido
      const { data: timeline, error: timelineError } = await supabaseAdmin
        .from('order_timeline')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at');

      return {
        ...order,
        items: items || [],
        timeline: timeline || []
      };

    } catch (error) {
      console.error('Error al obtener pedido:', error);
      throw error;
    }
  }

  // Obtener pedido por número
  static async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error || !order) {
        return null;
      }

      return await this.getOrderById(order.id);
    } catch (error) {
      console.error('Error al obtener pedido por número:', error);
      throw error;
    }
  }

  // Obtener todos los pedidos con filtros
  static async getAllOrders(filters: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Order[]> {
    try {
      let query = supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('order_status', filters.status);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data: orders, error } = await query;

      if (error) {
        throw new Error(`Error al obtener pedidos: ${error.message}`);
      }

      // Para cada pedido, obtener sus items
      const ordersWithItems = await Promise.all(
        (orders || []).map(async (order) => {
          const orderWithDetails = await this.getOrderById(order.id);
          return orderWithDetails || order;
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw error;
    }
  }

  // Actualizar estado del pedido
  static async updateOrderStatus(
    orderId: string, 
    newStatus: string, 
    notes?: string, 
    updatedBy?: string
  ): Promise<Order> {
    try {
      // Actualizar el pedido
      const { data: order, error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          order_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Error al actualizar estado: ${updateError.message}`);
      }

      // Añadir entrada al timeline
      await this.addTimelineEntry(orderId, newStatus, notes, updatedBy);

      return await this.getOrderById(orderId) as Order;
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw error;
    }
  }

  // Cancelar pedido
  static async cancelOrder(orderId: string, reason?: string, cancelledBy?: string): Promise<Order> {
    try {
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .update({ 
          order_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al cancelar pedido: ${error.message}`);
      }

      // Añadir entrada al timeline
      await this.addTimelineEntry(orderId, 'cancelled', reason || 'Pedido cancelado', cancelledBy);

      // Restaurar stock (simplificado)
      const orderDetails = await this.getOrderById(orderId);
      if (orderDetails?.items) {
        for (const item of orderDetails.items) {
          await this.updateProductStock(item.product_id, -item.quantity); // Restaurar stock
        }
      }

      return await this.getOrderById(orderId) as Order;
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      throw error;
    }
  }

  // Procesar reembolso
  static async processRefund(
    orderId: string, 
    amount: number, 
    reason?: string, 
    processedBy?: string
  ): Promise<any> {
    try {
      // Actualizar estado de pago
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .update({ 
          payment_status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al procesar reembolso: ${error.message}`);
      }

      // Crear registro de reembolso
      const refund = {
        id: uuidv4(),
        order_id: orderId,
        amount: amount,
        reason: reason || 'Reembolso procesado',
        processed_by: processedBy,
        processed_at: new Date().toISOString()
      };

      const { error: refundError } = await supabaseAdmin
        .from('order_refunds')
        .insert([refund]);

      if (refundError) {
        console.warn('Error al registrar reembolso:', refundError.message);
      }

      // Añadir entrada al timeline
      await this.addTimelineEntry(
        orderId, 
        'refunded', 
        `Reembolso procesado: €${amount}. ${reason || ''}`,
        processedBy
      );

      return refund;
    } catch (error) {
      console.error('Error al procesar reembolso:', error);
      throw error;
    }
  }

  // Obtener pedidos por email de cliente
  static async getOrdersByCustomerEmail(email: string): Promise<Order[]> {
    try {
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener pedidos del cliente: ${error.message}`);
      }

      return orders || [];
    } catch (error) {
      console.error('Error al obtener pedidos del cliente:', error);
      throw error;
    }
  }

  // Métodos auxiliares privados
  private static async addTimelineEntry(
    orderId: string, 
    status: string, 
    notes?: string, 
    createdBy?: string
  ): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('order_timeline')
        .insert([{
          id: uuidv4(),
          order_id: orderId,
          status: status,
          notes: notes,
          created_by: createdBy || 'sistema',
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.warn('Error al crear entrada en timeline:', error.message);
      }
    } catch (error) {
      console.warn('Error al crear entrada en timeline:', error);
    }
  }

  private static async createOrUpdateCustomer(
    customerInfo: CreateOrderData['customer_info'], 
    marketingConsent: boolean
  ): Promise<void> {
    try {
      // Verificar si el cliente ya existe
      const { data: existingCustomer } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('email', customerInfo.email)
        .single();

      if (!existingCustomer) {
        // Crear nuevo cliente
        const { error } = await supabaseAdmin
          .from('customers')
          .insert([{
            id: uuidv4(),
            first_name: customerInfo.first_name,
            last_name: customerInfo.last_name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            marketing_consent: marketingConsent,
            is_active: true
          }]);

        if (error) {
          console.warn('Error al crear cliente:', error.message);
        }
      }
    } catch (error) {
      console.warn('Error al gestionar cliente:', error);
    }
  }

  private static async updateProductStock(productId: string, quantitySold: number): Promise<void> {
    try {
      // Obtener stock actual
      const { data: product, error: getError } = await supabaseAdmin
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (getError || !product) {
        console.warn(`Producto no encontrado para actualizar stock: ${productId}`);
        return;
      }

      // Actualizar stock
      const newStock = Math.max(0, product.stock_quantity - quantitySold);
      
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) {
        console.warn('Error al actualizar stock:', updateError.message);
      }
    } catch (error) {
      console.warn('Error al actualizar stock del producto:', error);
    }
  }
}