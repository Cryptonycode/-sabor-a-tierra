const FARMER_UPLOADS_BUCKET = 'uploads-pendientes';

export const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop';

export const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';

/**
 * Convierte una ruta relativa del bucket público de agricultores en una URL
 * absoluta. Si ya es http(s) o está vacía, se devuelve tal cual o el fallback.
 */
export const formatFarmerImageUrl = (
  imagePath: string | null | undefined,
  fallback: string
): string => {
  if (!imagePath) return fallback;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
  if (!supabaseUrl) return fallback;

  const normalizedPath = imagePath.replace(/^\/+/, '');
  return `${supabaseUrl}/storage/v1/object/public/${FARMER_UPLOADS_BUCKET}/${normalizedPath}`;
};
