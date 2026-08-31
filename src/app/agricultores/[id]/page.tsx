import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import {
  DEFAULT_COVER_IMAGE,
  DEFAULT_PROFILE_IMAGE,
  formatFarmerImageUrl,
} from '@/lib/farmerImages';
import type { Database } from '@/types/database';
import type { ProductVariant } from '@/lib/variants';

type FarmerRow = Database['public']['Tables']['farmers']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row'];

type ProductWithVariants = ProductRow & {
  variants: ProductVariantRow[] | null;
};

interface FarmerPageProps {
  params: { id: string };
}

export default async function FarmerPage({ params }: FarmerPageProps) {
  const { id } = params;

  let farmer: FarmerRow | null = null;
  let farmerLoadError: string | null = null;

  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        farmerLoadError = 'No se pudo cargar el agricultor.';
      }
    } else {
      farmer = data;
    }
  } catch {
    farmerLoadError = 'No se pudo cargar el agricultor.';
  }

  if (farmerLoadError || !farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Agricultor no encontrado</h1>
          <p className="text-gray-600 mb-6">
            {farmerLoadError || 'Este agricultor no está disponible o no existe.'}
          </p>
          <Link href="/agricultores" className="btn-primary">
            Volver a agricultores
          </Link>
        </div>
      </div>
    );
  }

  let products: ProductWithVariants[] = [];
  let productsLoadError: string | null = null;

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('farmer_id', id)
      .eq('is_available', true);

    if (error) {
      productsLoadError = 'No se pudieron cargar los productos de este agricultor.';
    } else {
      products = (data as ProductWithVariants[] | null) ?? [];
    }
  } catch {
    productsLoadError = 'No se pudieron cargar los productos de este agricultor.';
  }

  const fullName = `${farmer.first_name} ${farmer.last_name}`;
  const coverSrc = formatFarmerImageUrl(farmer.cover_image_url, DEFAULT_COVER_IMAGE);
  const profileSrc = formatFarmerImageUrl(farmer.profile_image_url, DEFAULT_PROFILE_IMAGE);
  const description = farmer.description || farmer.story || farmer.short_description;

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white py-4 border-b">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Inicio</Link>
            <span className="mx-2">/</span>
            <Link href="/agricultores" className="hover:text-primary">Agricultores</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{fullName}</span>
          </nav>
        </div>
      </section>

      <section className="relative">
        <div className="relative h-56 sm:h-72 md:h-[28rem] w-full overflow-hidden">
          <Image
            src={coverSrc}
            alt={`Campo de ${fullName}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-16 sm:-mt-20 md:-mt-24">
            <div className="relative h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100">
              <Image
                src={profileSrc}
                alt={fullName}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="mt-6 pb-10 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{fullName}</h1>
            {(farmer.city || farmer.province) && (
              <p className="mt-1 text-gray-600">
                {[farmer.city, farmer.province].filter(Boolean).join(', ')}
              </p>
            )}
            <p className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              {farmer.hectares ?? 0} hectáreas
            </p>
            {description && (
              <p className="mt-5 text-gray-700 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sus productos</h2>

          {productsLoadError ? (
            <p className="text-red-600">{productsLoadError}</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">Este agricultor todavía no tiene productos publicados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price ?? 0}
                  main_image_url={product.main_image_url}
                  unit={product.unit ?? 'kg'}
                  category={product.category}
                  variants={(product.variants ?? []) as ProductVariant[]}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
