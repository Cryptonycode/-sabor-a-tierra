'use client';

import { useEffect, useState } from 'react';
import { discountService } from '@/services/discountService';

interface DiscountCode {
  id: string;
  code: string;
  discount_percentage?: number;
  discount_amount?: number;
  min_order_amount?: number;
  customer_email?: string | null;
  is_active: boolean;
  max_uses?: number;
  times_used?: number;
  expires_at?: string | null;
}

export default function DiscountsAdminPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: 10,
    min_order_amount: 0,
    max_uses: 1,
    customer_email: '',
    is_active: true
  });

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const response = await discountService.getAdminDiscounts();
      setDiscounts(response?.discounts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await discountService.createAdminDiscount({
      code: formData.code.trim().toUpperCase(),
      discount_percentage: Number(formData.discount_percentage),
      min_order_amount: Number(formData.min_order_amount) || 0,
      max_uses: Number(formData.max_uses) || 1,
      customer_email: formData.customer_email.trim() || null,
      is_active: formData.is_active
    });

    if (!response?.success) {
      alert(response?.message || 'No se pudo crear el cupón');
      return;
    }

    setFormData({
      code: '',
      discount_percentage: 10,
      min_order_amount: 0,
      max_uses: 1,
      customer_email: '',
      is_active: true
    });
    await loadDiscounts();
  };

  const toggleActive = async (discount: DiscountCode) => {
    const response = await discountService.updateAdminDiscount(discount.id, {
      is_active: !discount.is_active
    });
    if (!response?.success) {
      alert(response?.message || 'No se pudo actualizar el cupón');
      return;
    }
    await loadDiscounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cupón?')) return;
    const response = await discountService.deleteAdminDiscount(id);
    if (!response.ok) {
      alert('No se pudo eliminar el cupón');
      return;
    }
    await loadDiscounts();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Descuentos</h1>
        <p className="text-gray-600">Crea y administra cupones promocionales.</p>
      </div>

      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 grid md:grid-cols-6 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
          <input
            required
            value={formData.code}
            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="BIENVENIDA10-ABC123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">% Descuento</label>
          <input
            type="number"
            min={1}
            max={100}
            value={formData.discount_percentage}
            onChange={(e) => setFormData((prev) => ({ ...prev, discount_percentage: Number(e.target.value) }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pedido mínimo</label>
          <input
            type="number"
            min={0}
            value={formData.min_order_amount}
            onChange={(e) => setFormData((prev) => ({ ...prev, min_order_amount: Number(e.target.value) }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos</label>
          <input
            type="number"
            min={1}
            value={formData.max_uses}
            onChange={(e) => setFormData((prev) => ({ ...prev, max_uses: Number(e.target.value) }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <button type="submit" className="bg-primary text-white rounded-md py-2 px-4 hover:bg-primary/90">
          Crear cupón
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-6">Cargando descuentos...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {discounts.map((discount) => (
                <tr key={discount.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{discount.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{discount.discount_percentage || 0}%</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {discount.times_used || 0}/{discount.max_uses || 1}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        discount.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {discount.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm space-x-3">
                    <button onClick={() => toggleActive(discount)} className="text-indigo-600 hover:text-indigo-800">
                      {discount.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => handleDelete(discount.id)} className="text-red-600 hover:text-red-800">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
