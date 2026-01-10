// API Client para conectar con el backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Configuración base para requests
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Cliente API genérico
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...defaultOptions,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      // Si el backend devuelve JSON con error (401/400/etc), retornamos ese JSON
      // para que la UI pueda manejar el mensaje (p.ej., "Credenciales inválidas").
      if (!response.ok) {
        if (isJson) {
          return data as T;
        }
        throw new Error(`HTTP error! status: ${response.status} - ${String(data)}`);
      }

      return data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}

// Instancias y exportaciones
export const api = new ApiClient(API_BASE_URL);
export const apiClient = api; // alias para compatibilidad

// Tipos para las respuestas de la API
export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  price_per_kg?: number;
  price_per_box?: number;
  farmer_id: string;
  category: string;
  unit: string;
  main_image_url: string;
  is_available: boolean;
  status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiFarmer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  business_name?: string;
  description?: string;
  short_description?: string;
  story?: string;
  address: string;
  city: string;
  province: string;
  coordinates?: string;
  specialties: string[];
  certifications: string[];
  profile_image_url?: string;
  cover_image_url?: string;
  status: string;
  verified: boolean;
  years_experience: number;
  hectares: number;
  customers_served: number;
  created_at: string;
}

// Servicios específicos para cada entidad
export const productApi = {
  getAll: () => apiClient.get<ApiProduct[]>('/products'),
  getById: (id: string) => apiClient.get<ApiProduct>(`/products/${id}`),
  getByCategory: (category: string) => apiClient.get<ApiProduct[]>(`/products?category=${category}`),
  search: (query: string) => apiClient.get<ApiProduct[]>(`/products?search=${query}`),
  getFeatured: () => apiClient.get<ApiProduct[]>('/products?featured=true'),
};

export const farmerApi = {
  getAll: () => apiClient.get<ApiFarmer[]>('/farmers'),
  getById: (id: string) => apiClient.get<ApiFarmer>(`/farmers/${id}`),
  getBySpecialty: (specialty: string) => apiClient.get<ApiFarmer[]>(`/farmers/specialty/${specialty}`),
  search: (query: string) => apiClient.get<ApiFarmer[]>(`/farmers/search/${query}`),
};

export const orderApi = {
  create: (orderData: any) => apiClient.post('/orders', orderData),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
};

export const newsletterApi = {
  subscribe: (data: { email: string; first_name?: string; last_name?: string }) => 
    apiClient.post('/newsletter/subscribe', data),
};

export default apiClient;