import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import { markDiscountCodeAsUsed, validateDiscountCode } from '@/lib/server/discounts';
import { calculateShippingCostForLines, ShippableLine } from '@/lib/shipping';
import { CheckoutPayload, Order, OrderItem, OrderTimelineEntry, OrderStatus, PaymentStatus } from '@/types/order';

type CheckoutItemInput = {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price?: number;
};

type OrderItemInsert = {
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  product_image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  farmer_name: string;
};

const UUID_LENGTH = 36;

const ORDER_ITEMS_SELECT = '*, products(*), product_variants(*)';

// Las columnas de importe son DECIMAL(10,2): evita arrastrar errores binarios
// al sumar líneas y aplicar descuentos.
const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

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

// El carrito identifica cada línea como `${productId}-${variantId}`. Si el
// cliente no manda variant_id (carritos guardados por versiones anteriores),
// lo recuperamos de ese id compuesto para no perder la variante.
const parseItemIdentifiers = (item: CheckoutItemInput) => {
  const rawId = String(item.product_id || '');
  const isCompositeId = rawId.length > UUID_LENGTH;

  const productId = isCompositeId ? rawId.slice(0, UUID_LENGTH) : rawId;
  const embeddedVariantId = isCompositeId ? rawId.slice(UUID_LENGTH + 1) : '';
  const explicitVariantId = item.variant_id ? String(item.variant_id) : '';

  return {
    productId,
    variantId: explicitVariantId || embeddedVariantId || null
  };
};

// Fuente única de verdad del precio: nunca se confía en el unit_price que
// llega del navegador, siempre se resuelve contra la base de datos.
const resolveLinePricing = async (productId: string, variantId: string | null) => {
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, name, price, main_image_url, is_available')
    .eq('id', productId)
    .maybeSingle();

  if (productError) {
    console.error(`❌ DB Error buscando producto ${productId}:`, productError);
    throw new Error(`Error de BD con el producto ${productId}: ${productError.message}`);
  }

  if (!product) {
    throw new Error(`El producto con ID ${productId} no existe en la base de datos.`);
  }

  if (product.is_available !== true) {
    throw new Error(`El producto "${product.name}" ya no está disponible para su compra.`);
  }

  const productImageUrl = product.main_image_url ?? null;

  if (!variantId) {
    return {
      variantId: null,
      productName: product.name as string,
      productImageUrl,
      unitPrice: Number(product.price),
      // Sin variante no hay peso: ProductCard tampoco lo añade al carrito, y
      // products.weight_per_unit no debe usarse aquí o el envío calculado
      // dejaría de coincidir con el que vio el cliente.
      weight: 0
    };
  }

  const { data: variant, error: variantError } = await supabaseAdmin
    .from('product_variants')
    .select('id, product_id, name, price, is_active, weight')
    .eq('id', variantId)
    .maybeSingle();

  if (variantError) {
    console.error(`❌ DB Error buscando variante ${variantId}:`, variantError);
    throw new Error(`Error de BD con la variante ${variantId}: ${variantError.message}`);
  }

  if (!variant) {
    throw new Error(`La variante con ID ${variantId} no existe en la base de datos.`);
  }

  if (variant.product_id !== productId) {
    throw new Error(`La variante "${variant.name}" no pertenece al producto "${product.name}".`);
  }

  if (variant.is_active !== true) {
    throw new Error(`La variante "${variant.name}" ya no está disponible para su compra.`);
  }

  return {
    variantId: variant.id as string,
    productName: `${product.name} - ${variant.name}`,
    productImageUrl,
    unitPrice: Number(variant.price),
    // Mismo origen de peso que usa el carrito al añadir la variante.
    weight: Number(variant.weight) || 0
  };
};

const getOrderItemsData = async (items: CheckoutItemInput[], orderId: string) => {
  const orderItems: OrderItemInsert[] = [];
  const shippableLines: ShippableLine[] = [];
  let subtotal = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Cantidad inválida (${item.quantity}) para el producto ${item.product_id}.`);
    }

    const { productId, variantId } = parseItemIdentifiers(item);
    const { productName, productImageUrl, unitPrice, weight, variantId: resolvedVariantId } =
      await resolveLinePricing(productId, variantId);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error(`El producto "${productName}" no tiene un precio válido configurado.`);
    }

    const totalPrice = roundCurrency(unitPrice * quantity);
    subtotal = roundCurrency(subtotal + totalPrice);
    shippableLines.push({ weight, quantity });

    orderItems.push({
      order_id: orderId,
      product_id: productId,
      variant_id: resolvedVariantId,
      product_name: productName,
      product_image_url: productImageUrl,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      // La columna es NOT NULL en la base de datos.
      farmer_name: 'Sabor a Tierra'
    });
  }

  return { orderItems, subtotal, shippableLines };
};

// Degrada sin romper el pedido si todavía no se aplicó
// ORDER_ITEMS_VARIANTS_UPDATE.sql: el nombre y el precio de la variante ya
// viajan en el snapshot de product_name / unit_price.
const insertOrderItems = async (orderItems: OrderItemInsert[]) => {
  const { error } = await supabaseAdmin.from('order_items').insert(orderItems);
  if (!error) return;

  const missingVariantColumn = error.message.includes('variant_id');
  if (!missingVariantColumn) {
    console.error('❌ DB Error (order_items):', error);
    throw new Error(`No se pudieron guardar los productos del pedido: ${error.message}`);
  }

  console.warn(
    '⚠️ order_items.variant_id no disponible. Ejecuta ORDER_ITEMS_VARIANTS_UPDATE.sql en Supabase.'
  );

  const withoutVariant = orderItems.map(({ variant_id: _variantId, ...rest }) => rest);
  const { error: retryError } = await supabaseAdmin.from('order_items').insert(withoutVariant);

  if (retryError) {
    console.error('❌ DB Error (order_items sin variante):', retryError);
    throw new Error(`No se pudieron guardar los productos del pedido: ${retryError.message}`);
  }
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

    const { orderItems, subtotal, shippableLines } = await getOrderItemsData(payload.items, insertedOrder.id);
    const shippingCost = calculateShippingCostForLines(shippableLines);

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
        discountAmount = roundCurrency((subtotal * validation.percentage) / 100);
        discountCodeUsed = payload.discountCode;
      }
    }

    const finalSubtotal = roundCurrency(Math.max(0, subtotal - discountAmount));
    const totalAmount = roundCurrency(finalSubtotal + shippingCost);

    if (orderItems.length > 0) {
      await insertOrderItems(orderItems);
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

// Si la relación order_items -> product_variants aún no existe, PostgREST
// rechaza el join entero. Reintentamos sin variantes para no dejar el pedido
// sin líneas visibles.
const fetchOrderItems = async (orderId: string) => {
  const { data, error } = await supabaseAdmin
    .from('order_items')
    .select(ORDER_ITEMS_SELECT)
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (!error) {
    return data || [];
  }

  console.error('⚠️ Join de variantes no disponible en order_items:', error.message);

  const { data: fallbackData, error: fallbackError } = await supabaseAdmin
    .from('order_items')
    .select('*, products(*)')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (fallbackError) {
    console.error('❌ DB Error (order_items select):', fallbackError);
    return [];
  }

  return fallbackData || [];
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

  const [items, { data: timeline }] = await Promise.all([
    fetchOrderItems(orderId),
    supabaseAdmin.from('order_timeline').select('*').eq('order_id', orderId).order('created_at', { ascending: true })
  ]);

  const mappedItems = items.map((item) => ({
    ...item,
    product_image: item.products?.main_image_url || item.product_image_url || null
  }));

  return mapOrderForClient(order as OrderRow, mappedItems as OrderItem[], (timeline || []) as OrderTimelineEntry[]);
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