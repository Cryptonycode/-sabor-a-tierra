import { CheckoutPayload, GetOrderResponse, GetOrdersResponse, Order } from '@/types/order';

const parseJsonOrThrow = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Error en la solicitud');
  }
  return data;
};

export const orderService = {
  async create(payload: CheckoutPayload): Promise<Order> {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = (await parseJsonOrThrow(response)) as GetOrderResponse;
    return data.order;
  },

  async getById(orderId: string): Promise<Order> {
    const response = await fetch(`/api/orders/${orderId}`, {
      credentials: 'include'
    });
    const data = (await parseJsonOrThrow(response)) as GetOrderResponse;
    return data.order;
  },

  async getMyOrders(): Promise<GetOrdersResponse> {
    const response = await fetch('/api/orders/my-orders', {
      credentials: 'include'
    });
    return (await parseJsonOrThrow(response)) as GetOrdersResponse;
  },

  async getMyOrderById(orderId: string): Promise<GetOrderResponse> {
    const response = await fetch(`/api/orders/my-orders/${orderId}`, {
      credentials: 'include'
    });
    return (await parseJsonOrThrow(response)) as GetOrderResponse;
  },

  async getAdminOrders(params: { status?: string; page?: number; limit?: number } = {}): Promise<GetOrdersResponse> {
    const search = new URLSearchParams();
    if (params.status) search.set('status', params.status);
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));

    const response = await fetch(`/api/admin/orders${search.size ? `?${search.toString()}` : ''}`, {
      credentials: 'include'
    });
    return (await parseJsonOrThrow(response)) as GetOrdersResponse;
  },

  async getAdminOrderById(orderId: string): Promise<GetOrderResponse> {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      credentials: 'include'
    });
    return (await parseJsonOrThrow(response)) as GetOrderResponse;
  },

  async updateAdminOrder(
    orderId: string,
    payload: { status?: string; payment_status?: string; tracking_number?: string; notes?: string }
  ): Promise<GetOrderResponse> {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return (await parseJsonOrThrow(response)) as GetOrderResponse;
  }
};
