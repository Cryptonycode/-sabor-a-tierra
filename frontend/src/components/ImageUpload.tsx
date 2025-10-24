'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { authAPI } from '@/lib/authApi';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (value: string) => void;
  label?: string;
  uploadUrl?: string; // e.g. '/uploads/product-image' o '/uploads/farmer-application'
  requiresAuth?: boolean; // por defecto true
  responseKey?: 'publicUrl' | 'path'; // clave de respuesta para extraer el valor
}

export default function ImageUpload({ currentImageUrl, onImageUploaded, label = 'Imagen', uploadUrl = '/uploads/product-image', requiresAuth = true, responseKey = 'publicUrl' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato no soportado. Usa JPG, PNG o WEBP');
      return;
    }

    // Validar tamaño (25MB máximo)
    if (file.size > 25 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 25MB');
      return;
    }

    // Crear preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir a servidor
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const target = uploadUrl.startsWith('http') ? uploadUrl : `${base}${uploadUrl}`;
      const token = requiresAuth ? authAPI.getToken() : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(target, {
        method: 'POST',
        body: formData,
        credentials: requiresAuth ? 'include' : 'same-origin',
        headers: requiresAuth ? headers : undefined,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al subir la imagen');
      }

      // Notificar al componente padre con la clave configurada
      const value = data?.[responseKey];
      onImageUploaded(value);
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div className="space-y-3">
        {/* Preview de la imagen */}
        {preview && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
              title="Eliminar imagen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Botón de subida */}
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-2"></div>
                  <p className="text-sm text-gray-600">Subiendo imagen...</p>
                </>
              ) : (
                <>
                  <svg className="w-10 h-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-1 text-sm text-gray-600">
                    <span className="font-semibold">Click para subir</span> o arrastra
                  </p>
                  <p className="text-xs text-gray-500">JPG, PNG o WEBP (Máx. 25MB)</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

