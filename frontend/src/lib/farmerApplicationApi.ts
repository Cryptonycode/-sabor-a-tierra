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
  main_products?: string;
  description: string;
  website?: string;
  social_media?: string;
  profile_image_path?: string;
}

export const farmerApplicationApi = {
  submit: (data: FarmerApplicationData) => 
    fetch('/api/public/farmer-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then((response) => response.json()),
};

