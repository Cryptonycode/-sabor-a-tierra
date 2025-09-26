import { supabaseAdmin } from '../config/supabase';
import { Order, OrderItem, OrderWithItems, CreateOrderRequest } from '../types/database';

export class OrderService {
  // Crear nueva orden con sus items
  static async createOrder(orderData: CreateOrderRequest): Promise<OrderWithItems> {
    // Calcular el subtotal
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    
    // Calcular impuestos (ejemplo: 10% IVA)
    const taxAmount = subtotal * 0.10;
    
    // Calcular total
    const totalAmount = subtotal + orderData.shipping_cost + taxAmount;

    // Crear la orden
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        customer_id: orderData.customer_id,
        customer_email: orderData.customer_email,
        customer_first_name: orderData.customer_first_name,
        customer_last_name: orderData.customer_last_name,
        customer_phone: orderData.customer_phone,
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_postal_code: orderData.shipping_postal_code,
        shipping_province: orderData.shipping_province,
        shipping_notes: orderData.shipping_notes,
        subtotal: subtotal,
        shipping_cost: orderData.shipping_cost,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (orderError) {
      throw new Error(`Error al crear orden: ${orderError.message}`);
    }

    // Obtener información de productos y agricultores para los items
    const enrichedItems = [];
    for (const item of orderData.items) {
      // Obtener producto con agricultor
      const { data: productData, error: productError } = await supabaseAdmin
        .from('products')
        .select(`
          *,
          farmer:farmers(*)
        `)
        .eq('id', item.product_id)
        .single();

      if (productError || !productData) {
        // Si falla, eliminar la orden
        await supabaseAdmin.from('orders').delete().eq('id', order.id);
        throw new Error(`Producto no encontrado: ${item.product_id}`);
      }

      enrichedItems.push({
        order_id: order.id,
        product_id: item.product_id,
        product_name: productData.name,
        product_description: productData.short_description || productData.description,
        product_image_url: productData.main_image_url,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
        farmer_name: `${productData.farmer.first_name} ${productData.farmer.last_name}`,
        farmer_id: productData.farmer_id
      });
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(enrichedItems)
      .select(`
        *,
        product:products(*),
        farmer:farmers(*)
      `);

    if (itemsError) {
      // Si falla la creación de items, eliminar la orden
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      throw new Error(`Error al crear items de la orden: ${itemsError.message}`);
    }

    return {
      ...order,
      order_items: items || []
    };
  }

  // Obtener orden por ID con sus items y productos
  static async getOrderById(id: string): Promise<OrderWithItems | null> {
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products(*)
        )
      `)
      .eq('id', id)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener orden: ${orderError.message}`);
    }

    return order;
  }

  // Obtener todas las órdenes
  static async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener órdenes: ${error.message}`);
    }

    return data || [];
  }

  // Obtener órdenes por email del cliente
  static async getOrdersByCustomerEmail(email: string): Promise<OrderWithItems[]> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products(*)
        )
      `)
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener órdenes del cliente: ${error.message}`);
    }

    return data || [];
  }

  // Actualizar estado de la orden
  static async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar estado de la orden: ${error.message}`);
    }

    return data;
  }

  // Eliminar orden
  static async deleteOrder(id: string): Promise<void> {
    // Primero eliminar los items de la orden
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('order_id', id);

    if (itemsError) {
      throw new Error(`Error al eliminar items de la orden: ${itemsError.message}`);
    }

    // Luego eliminar la orden
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (orderError) {
      throw new Error(`Error al eliminar orden: ${orderError.message}`);
    }
  }

  // Obtener estadísticas de órdenes
  static async getOrderStats() {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('status, total_amount, created_at');

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    const stats = {
      total_orders: data?.length || 0,
      total_revenue: data?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
      pending_orders: data?.filter(order => order.status === 'pending').length || 0,
      completed_orders: data?.filter(order => order.status === 'delivered').length || 0
    };

    return stats;
  }
}
