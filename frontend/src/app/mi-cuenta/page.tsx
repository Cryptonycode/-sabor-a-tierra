'use client';

import { useEffect, useState } from 'react';
import { customerService } from '@/services/customerService';

export default function MyAccountPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    default_shipping_address: '',
    default_shipping_city: '',
    default_shipping_postal_code: '',
    default_shipping_province: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') || undefined : undefined;
        const response = await customerService.getMe(token);
        if (!response?.success || !response?.customer) {
          setError(response?.message || 'No se pudo cargar tu perfil');
          return;
        }

        setFormData({
          first_name: response.customer.first_name || '',
          last_name: response.customer.last_name || '',
          phone: response.customer.phone || '',
          default_shipping_address: response.customer.default_shipping_address || '',
          default_shipping_city: response.customer.default_shipping_city || '',
          default_shipping_postal_code: response.customer.default_shipping_postal_code || '',
          default_shipping_province: response.customer.default_shipping_province || ''
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') || undefined : undefined;
    const response = await customerService.updateMe(formData, token);
    if (!response?.success) {
      setError(response?.message || 'No se pudo guardar tu perfil');
      return;
    }
    setSaved(true);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando perfil...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Cuenta</h1>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border border-gray-300 rounded-md px-3 py-2"
                placeholder="Nombre"
                value={formData.first_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
              />
              <input
                className="border border-gray-300 rounded-md px-3 py-2"
                placeholder="Apellidos"
                value={formData.last_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
              />
            </div>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Dirección"
              value={formData.default_shipping_address}
              onChange={(e) => setFormData((prev) => ({ ...prev, default_shipping_address: e.target.value }))}
            />
            <div className="grid md:grid-cols-3 gap-4">
              <input
                className="border border-gray-300 rounded-md px-3 py-2"
                placeholder="Ciudad"
                value={formData.default_shipping_city}
                onChange={(e) => setFormData((prev) => ({ ...prev, default_shipping_city: e.target.value }))}
              />
              <input
                className="border border-gray-300 rounded-md px-3 py-2"
                placeholder="CP"
                value={formData.default_shipping_postal_code}
                onChange={(e) => setFormData((prev) => ({ ...prev, default_shipping_postal_code: e.target.value }))}
              />
              <input
                className="border border-gray-300 rounded-md px-3 py-2"
                placeholder="Provincia"
                value={formData.default_shipping_province}
                onChange={(e) => setFormData((prev) => ({ ...prev, default_shipping_province: e.target.value }))}
              />
            </div>

            {saved && <p className="text-green-600 text-sm">Perfil actualizado correctamente.</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
              Guardar cambios
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
