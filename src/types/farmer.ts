export type FarmerStatus = 'pending' | 'approved' | 'rejected';

/**
 * El panel de administración combina dos tablas de Supabase:
 * - `farmer_applications`: solicitudes recibidas desde el formulario público.
 * - `farmers`: fichas reales creadas al aprobar una solicitud.
 * `source` indica de cuál procede cada registro para poder enrutar las acciones.
 */
export type FarmerRecordSource = 'application' | 'farmer';

export interface FarmerApplicationRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  production_type: string | null;
  main_products: string | null;
  certifications: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  province: string | null;
  farming_experience: number | null;
  hectares: number | null;
  description: string | null;
  website: string | null;
  social_media: string | null;
  profile_image_path: string | null;
  status: FarmerStatus;
  rejection_reason: string | null;
  notes: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  description: string | null;
  short_description: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  province: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  production_type: string | null;
  years_experience: number | null;
  hectares: number | null;
  profile_image_url: string | null;
  website: string | null;
  social_media: Record<string, string> | string | null;
  status: string;
  verified: boolean | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Modelo de vista normalizado que consume toda la UI de administración. */
export interface FarmerRecord {
  id: string;
  source: FarmerRecordSource;
  status: FarmerStatus;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  productionType: string | null;
  specialties: string[];
  certifications: string[];
  address: string | null;
  postalCode: string | null;
  city: string | null;
  province: string | null;
  yearsExperience: number | null;
  hectares: number | null;
  description: string | null;
  website: string | null;
  socialMedia: string | null;
  profileImageUrl: string | null;
  rejectionReason: string | null;
  notes: string | null;
  verified: boolean;
  createdAt: string;
  approvedAt: string | null;
}
