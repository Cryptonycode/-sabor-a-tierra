import { apiClient } from './api';

export interface FarmerApplicationData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
  farming_experience: number;
  hectares?: number;
  production_type: 'organic' | 'conventional' | 'integrated';
  description: string;
  website?: string;
  social_media?: string;
  profile_image_path?: string;
}

export const farmerApplicationApi = {
  submit: (data: FarmerApplicationData) => 
    apiClient.post('/farmer-applications', data),
};

