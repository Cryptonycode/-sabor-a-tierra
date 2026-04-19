import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import { markDiscountCodeAsUsed, validateDiscountCode } from '@/lib/server/discounts';
import { CheckoutPayload, Order, OrderItem, OrderTimelineEntry, OrderStatus, PaymentStatus } from '@/types/order';

type CheckoutItemInput = {
  product_id: string;
  quantity: number;
  unit_price?: number;
};

const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `ORD-${year}-${timestamp}`;
};

const calculateEstimatedDelivery = () => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  return deliveryDate.toISOString().slice(0, 10);
};

type OrderRow = Omit<Order, 'order_status' | 'customer_name' | 'delivery_address' | 'delivery_city' | 'delivery_postal_code' | 'delivery_notes' | 'estimated_delivery' | 'items' | 'timeline'>;

export const mapOrderForClient = (
  order: OrderRow,
  items: OrderItem[] = [],
  timeline: OrderTimelineEntry[] = []
): Order => ({
  ...order,
  order_status: order.status as OrderStatus,
  customer_name: `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim(),
  delivery_address: order.shipping_address,
  delivery_city: order.shipping_city,
  delivery_postal_code: order.shipping_postal_code,
  delivery_notes: order.shipping_notes,
  estimated_delivery: order.estimated_delivery_date,
  items,
  timeline
});

const addTimelineEntry = async (
  orderId: string,
  status: string,
  notes?: string,
  createdBy?: string
) => {
  await supabaseAdmin.from('order_timeline').insert([
    {
      order_id: orderId,
      status,
      notes: notes ?? null,
      created_by: createdBy ?? 'sistema',
      created_at: new Date().toISOString()
    }
  ]);
};

const findOrCreateCustomer = async (
  customerInfo: CheckoutPayload['customer_info'],
  marketingConsent: boolean
) => {
  const { data: existing } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('email', customerInfo.email)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const { data: inserted, error } = await supabaseAdmin
    .from('customers')
    .insert([
      {
        email: customerInfo.email,
        first_name: customerInfo.first_name,
        last_name: customerInfo.last_name,
        phone: customerInfo.phone || null, // Aseguramos null en vez de undefined
        marketing_emails: !!marketingConsent,
        newsletter_subscribed: false,
        email_verified: false
      }
    ])
    .select('id')
    .single();

  if (error || !inserted?.id) {
    console.error("❌ DB Error (customers):", error);
    throw new Error(`No se pudo crear/obtener cliente: ${error?.message || 'Error desconocido'}`);
  }

  return inserted.id;
};

const getOrderItemsData = async (items: CheckoutItemInput[], orderId: string) => {
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const realProductId = item.product_id.length > 36 
      ? item.product_id.substring(0, 36) 
      : item.product_id;

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('id, name, price, is_available')
      .eq('id', realProductId)
      .maybeSingle();

    if (error) {
      console.error(`❌ DB Error buscando producto ${realProductId}:`, error);
      throw new Error(`Error de BD con el producto ${realProductId}: ${error.message}`);
    }

    if (!product) {
      throw new Error(`El producto con ID ${realProductId} no existe en la base de datos.`);
    }

    if (product.is_available !== true) {
      throw new Error(`El producto "${product.name}" ya no está disponible para su compra.`);
    }

    const unitPrice = Number(product.price ?? item.unit_price ?? 0);
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    orderItems.push({
      order_id: orderId,
      product_id: realProductId,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      // 👇 AQUÍ ESTÁ LA SOLUCIÓN. La base de datos EXIGE un texto aquí 👇
      farmer_name: 'Sabor a Tierra' 
    });
  }

  return { orderItems, subtotal };
};

export const createOrderFromCheckout = async (payload: CheckoutPayload) => {
  try {
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error('El pedido debe incluir al menos un producto');
    }

    const customerId = await findOrCreateCustomer(payload.customer_info, payload.marketing_consent);
    const orderNumber = generateOrderNumber();
    const estimatedDeliveryDate = calculateEstimatedDelivery();

    const { data: insertedOrder, error: orderInsertError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          customer_id: customerId,
          customer_email: payload.customer_info.email,
          customer_first_name: payload.customer_info.first_name,
          customer_last_name: payload.customer_info.last_name,
          customer_phone: payload.customer_info.phone || null,
          shipping_address: payload.delivery_address.address,
          shipping_city: payload.delivery_address.city,
          shipping_postal_code: payload.delivery_address.postal_code,
          shipping_province: payload.delivery_address.province || null, // Vital: null en vez de undefined
          shipping_notes: payload.delivery_address.delivery_notes || null, // Vital: null en vez de undefined
          subtotal: 0,
          shipping_cost: 0,
          tax_amount: 0,
          total_amount: 0,
          status: 'pending' as OrderStatus,
          payment_status: (payload.payment_method === 'bizum' || payload.payment_method === 'transferencia' ? 'pending' : 'paid') as PaymentStatus,
          payment_method: payload.payment_method,
          estimated_delivery_date: estimatedDeliveryDate
        }
      ])
      .select('*')
      .single();

    if (orderInsertError || !insertedOrder) {
      console.error("❌ DB Error (orders):", orderInsertError);
      throw new Error(`No se pudo crear la orden: ${orderInsertError?.message || 'Error desconocido'}`);
    }

    const { orderItems, subtotal } = await getOrderItemsData(payload.items, insertedOrder.id);
    const shippingCost = subtotal > 50 ? 0 : subtotal <= 4 ? 3.9 : subtotal <= 10 ? 4.45 : subtotal <= 15 ? 5.9 : 10.95;

    let discountAmount = 0;
    let discountCodeUsed: string | null = null;

    if (payload.discountCode) {
      const validation = await validateDiscountCode({
        code: payload.discountCode,
        customerEmail: payload.customer_info.email,
        subtotal
      });

      if (!validation.isValid) {
        throw new Error(validation.error || 'Cupón inválido');
      }

      if (typeof validation.percentage === 'number') {
        discountAmount = (subtotal * validation.percentage) / 100;
        discountCodeUsed = payload.discountCode;
      }
    }

    const finalSubtotal = Math.max(0, subtotal - discountAmount);
    const totalAmount = finalSubtotal + shippingCost;

    if (orderItems.length > 0) {
      const { error: itemError } = await supabaseAdmin.from('order_items').insert(orderItems);
      if (itemError) {
        console.error("❌ DB Error (order_items):", itemError);
        throw new Error(`No se pudieron guardar los productos del pedido: ${itemError.message}`);
      }
    }

    const { error: updateOrderError } = await supabaseAdmin
      .from('orders')
      .update({
        subtotal: finalSubtotal,
        shipping_cost: shippingCost,
        tax_amount: 0,
        total_amount: totalAmount,
        discount_code_used: discountCodeUsed,
        discount_amount: discountAmount
      })
      .eq('id', insertedOrder.id);

    if (updateOrderError) {
      console.error("❌ DB Error (orders update):", updateOrderError);
      throw new Error(`No se pudo actualizar el total del pedido: ${updateOrderError.message}`);
    }

    await addTimelineEntry(insertedOrder.id, 'pending', 'Pedido recibido y en proceso de confirmación');

    if (discountCodeUsed) {
      await markDiscountCodeAsUsed(discountCodeUsed, insertedOrder.id);
    }

    return getOrderById(insertedOrder.id);

  } catch (error: any) {
    console.error("🔥🔥🔥 ERROR CRÍTICO AL CREAR PEDIDO:", error);
    throw error;
  }
};

export const getOrderById = async (orderId: string) => {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return null;
  }

  const [{ data: items }, { data: timeline }] = await Promise.all([
    supabaseAdmin.from('order_items').select('*').eq('order_id', orderId).order('created_at', { ascending: true }),
    supabaseAdmin.from('order_timeline').select('*').eq('order_id', orderId).order('created_at', { ascending: true })
  ]);

  return mapOrderForClient(order as OrderRow, (items || []) as OrderItem[], (timeline || []) as OrderTimelineEntry[]);
};

export const getAdminOrders = async (params: { status?: string; page?: number; limit?: number }) => {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`No se pudieron obtener pedidos: ${error.message}`);
  }

  const orders = await Promise.all((data || []).map((order) => getOrderById(order.id)));
  return {
    orders: orders.filter(Boolean),
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0
    }
  };
};

export const updateAdminOrder = async (
  orderId: string,
  payload: { status?: string; payment_status?: string; tracking_number?: string; notes?: string; updated_by?: string }
) => {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (payload.status) updateData.status = payload.status;
  if (payload.payment_status) updateData.payment_status = payload.payment_status;
  if (payload.tracking_number) updateData.tracking_number = payload.tracking_number;

  const { error } = await supabaseAdmin.from('orders').update(updateData).eq('id', orderId);
  if (error) {
    throw new Error(`No se pudo actualizar el pedido: ${error.message}`);
  }

  if (payload.status) {
    await addTimelineEntry(orderId, payload.status, payload.notes, payload.updated_by);
  }

  return getOrderById(orderId);
};