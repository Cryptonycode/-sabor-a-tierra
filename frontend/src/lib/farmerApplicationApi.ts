import { apiClient } from './api';

export interface FarmerApplicationData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  business_name?: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
  farming_experience: number;
  hectares?: number;
  production_type: 'organic' | 'conventional' | 'integrated';
  main_products: string;
  description: string;
  certifications?: string;
  website?: string;
  social_media?: string;
}

export const farmerApplicationApi = {
  submit: (data: FarmerApplicationData) => 
    apiClient.post('/farmer-applications', data),
};

