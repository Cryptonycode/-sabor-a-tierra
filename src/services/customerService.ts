export const customerService = {
  async getAdminCustomers(params?: { search?: string; status?: 'all' | 'active' | 'inactive'; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const response = await fetch(`/api/admin/customers${query.toString() ? `?${query.toString()}` : ''}`, {
      credentials: 'include'
    });
    return response.json();
  },

  async getAdminCustomerById(id: string, includeOrders = false) {
    const response = await fetch(`/api/admin/customers/${id}${includeOrders ? '?include_orders=true' : ''}`, {
      credentials: 'include'
    });
    return response.json();
  },

  async updateAdminCustomer(id: string, payload: Record<string, unknown>) {
    const response = await fetch(`/api/admin/customers/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  async deleteAdminCustomer(id: string) {
    return fetch(`/api/admin/customers/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
  },

  async getMe(token?: string) {
    const response = await fetch('/api/customers/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: 'include'
    });
    return response.json();
  },

  async updateMe(payload: Record<string, unknown>, token?: string) {
    const response = await fetch('/api/customers/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return response.json();
  }
};
