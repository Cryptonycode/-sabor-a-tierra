import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PUBLIC_ALLOWED_BUCKETS = new Set(['farmer-applications', 'uploads-pendientes']);

const sanitizeSegment = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const getExtensionFromType = (contentType: string): string => {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/jpeg' || contentType === 'image/jpg') return 'jpg';
  return 'webp';
};

export async function POST(request: Request) {
  try {
    const { fileName, bucket, contentType } = await request.json();

    if (!fileName || !bucket || !contentType) {
      return NextResponse.json(
        { success: false, message: 'fileName, bucket y contentType son requeridos' },
        { status: 400 }
      );
    }

    const normalizedBucket = sanitizeSegment(String(bucket));
    if (!PUBLIC_ALLOWED_BUCKETS.has(normalizedBucket)) {
      return NextResponse.json(
        { success: false, message: 'Bucket no permitido para subida pública' },
        { status: 403 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { success: false, message: 'Tipo de archivo no soportado' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Configuración de Supabase incompleta en servidor' },
        { status: 500 }
      );
    }

    const ext = getExtensionFromType(contentType);
    const generatedName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const path = `applications/${generatedName}`;

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase.storage.from(normalizedBucket).createSignedUploadUrl(path);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { success: false, message: error?.message || 'No se pudo generar la firma de subida' },
        { status: 500 }
      );
    }

    const signedUploadUrl = data.signedUrl.startsWith('http')
      ? data.signedUrl
      : `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/${data.signedUrl.replace(/^\/+/, '')}`;

    return NextResponse.json({
      success: true,
      bucket: normalizedBucket,
      path: data.path || path,
      signedUrl: signedUploadUrl
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}
