import type {
  FarmerApplicationRow,
  FarmerRecord,
  FarmerRow,
  FarmerStatus
} from '@/types/farmer';

export const FARMER_STATUS_LABELS: Record<FarmerStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aceptado',
  rejected: 'Rechazado'
};

export const FARMER_STATUS_BADGE_CLASSES: Record<FarmerStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  approved: 'bg-primary/10 text-primary ring-primary/20',
  rejected: 'bg-rose-100 text-rose-700 ring-rose-200'
};

const PRODUCTION_TYPE_LABELS: Record<string, string> = {
  organic: 'Ecológica',
  conventional: 'Tradicional',
  traditional: 'Tradicional',
  integrated: 'Integrada',
  biodynamic: 'Biodinámica',
  artisanal: 'Artesanal'
};

export const getProductionTypeLabel = (type?: string | null) =>
  type ? PRODUCTION_TYPE_LABELS[type] ?? type : '—';

const splitToList = (value?: string | null): string[] =>
  value
    ? String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

/** `farmers.social_media` es JSONB y `farmer_applications.social_media` texto plano. */
const normalizeSocialMedia = (value: Record<string, string> | string | null | undefined): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value.trim() || null;

  const entries = Object.entries(value).filter(([, link]) => Boolean(link));
  if (entries.length === 0) return null;
  return entries.map(([network, link]) => `${network}: ${link}`).join(' · ');
};

/**
 * Los estados `suspended` y cualquier valor desconocido de `farmers.status`
 * se agrupan como rechazados para que la ficha nunca quede fuera de las pestañas.
 */
const normalizeStatus = (status?: string | null): FarmerStatus => {
  if (status === 'pending' || status === 'approved') return status;
  return 'rejected';
};

const buildFullName = (firstName?: string | null, lastName?: string | null) =>
  [firstName, lastName].filter(Boolean).join(' ').trim() || 'Sin nombre';

export const mapApplicationToRecord = (application: FarmerApplicationRow): FarmerRecord => ({
  id: application.id,
  source: 'application',
  status: normalizeStatus(application.status),
  firstName: application.first_name,
  lastName: application.last_name,
  fullName: buildFullName(application.first_name, application.last_name),
  email: application.email,
  phone: application.phone,
  businessName: application.business_name,
  productionType: application.production_type,
  specialties: splitToList(application.main_products),
  certifications: splitToList(application.certifications),
  address: application.address,
  postalCode: application.postal_code,
  city: application.city,
  province: application.province,
  yearsExperience: application.farming_experience,
  hectares: application.hectares,
  description: application.description,
  website: application.website,
  socialMedia: normalizeSocialMedia(application.social_media),
  profileImageUrl: application.profile_image_path,
  rejectionReason: application.rejection_reason,
  notes: application.notes,
  verified: false,
  createdAt: application.created_at,
  approvedAt: application.approved_at
});

export const mapFarmerToRecord = (farmer: FarmerRow): FarmerRecord => ({
  id: farmer.id,
  source: 'farmer',
  status: normalizeStatus(farmer.status),
  firstName: farmer.first_name,
  lastName: farmer.last_name,
  fullName: buildFullName(farmer.first_name, farmer.last_name),
  email: farmer.email,
  phone: farmer.phone,
  businessName: farmer.business_name,
  productionType: farmer.production_type,
  specialties: farmer.specialties ?? [],
  certifications: farmer.certifications ?? [],
  address: farmer.address,
  postalCode: farmer.postal_code,
  city: farmer.city,
  province: farmer.province,
  yearsExperience: farmer.years_experience,
  hectares: farmer.hectares,
  description: farmer.description ?? farmer.short_description,
  website: farmer.website,
  socialMedia: normalizeSocialMedia(farmer.social_media),
  profileImageUrl: farmer.profile_image_url,
  rejectionReason: null,
  notes: null,
  verified: Boolean(farmer.verified),
  createdAt: farmer.created_at,
  approvedAt: farmer.approved_at
});

export const formatFarmerDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

export const matchesFarmerSearch = (record: FarmerRecord, term: string) => {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;

  return [record.fullName, record.email, record.businessName, record.city, record.province]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(normalized));
};
