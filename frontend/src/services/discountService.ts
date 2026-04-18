export interface DiscountValidationResult {
  isValid: boolean;
  percentage: number | null;
  amount: number | null;
  minOrderAmount: number | null;
  code?: string;
  error?: string;
}

export const discountService = {
  async validatePublic(data: { code: string; customerEmail?: string; subtotal?: number }): Promise<DiscountValidationResult> {
    const response = await fetch('/api/public/discounts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getAdminDiscounts() {
    const response = await fetch('/api/admin/discounts', {
      credentials: 'include'
    });
    return response.json();
  },

  async createAdminDiscount(payload: Record<string, unknown>) {
    const response = await fetch('/api/admin/discounts', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  async updateAdminDiscount(id: string, payload: Record<string, unknown>) {
    const response = await fetch(`/api/admin/discounts/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  async deleteAdminDiscount(id: string) {
    const response = await fetch(`/api/admin/discounts/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return response;
  },

  async registerCustomer(payload: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    password?: string;
    marketing_emails?: boolean;
  }) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return response.json();
  }
};
