import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_COOKIE_NAME = 'admin_token';

const getBackendApiUrl = () => {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

const sanitizeSegment = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const normalizeFolder = (folder?: string): string | undefined => {
  if (!folder) return undefined;
  return folder
    .split('/')
    .map((segment) => sanitizeSegment(segment))
    .filter(Boolean)
    .join('/');
};

const getExtensionFromType = (contentType: string): string => {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/jpeg' || contentType === 'image/jpg') return 'jpg';
  return 'webp';
};

export async function POST(request: Request) {
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const verifyResponse = await fetch(`${getBackendApiUrl()}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({}),
      cache: 'no-store'
    });

    if (!verifyResponse.ok) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }

    const { fileName, bucket, contentType, folder } = await request.json();

    if (!fileName || !bucket || !contentType) {
      return NextResponse.json(
        { success: false, message: 'fileName, bucket y contentType son requeridos' },
        { status: 400 }
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

    const normalizedBucket = sanitizeSegment(String(bucket));
    const normalizedFolder = normalizeFolder(folder);
    const baseName = sanitizeSegment(String(fileName).replace(/\.[^.]+$/, '')) || 'image';
    const ext = getExtensionFromType(contentType);
    const generatedFileName = `${crypto.randomUUID()}-${baseName}.${ext}`;
    const path = normalizedFolder ? `${normalizedFolder}/${generatedFileName}` : generatedFileName;

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
      signedUrl: signedUploadUrl,
      token: data.token
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
