'use client';
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';

interface ProductVariant {
  id?: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  sku?: string;
  weight?: number;
  unit?: string;
  pieces?: number;
  is_available: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  price_per_kg?: number;
  price_per_box?: number;
  farmer_id: string;
  farmer_name?: string;
  category: string;
  unit: string;
  main_image_url?: string;
  images?: string[];
  is_available: boolean;
  stock_quantity: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  farmer_id: string;
  category: string;
  unit: string;
  main_image_url: string;
  is_available: boolean;
  stock_quantity: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
}

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    farmer_id: '',
    category: '',
    unit: 'kg',
    main_image_url: '',
    is_available: true,
    stock_quantity: 0,
    status: 'published', // Cambiado de 'draft' a 'published'
    featured: false
  });

  // Estado para gestionar variantes
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantFormData, setVariantFormData] = useState<ProductVariant>({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    sku: '',
    weight: 0,
    unit: 'kg',
    pieces: 1,
    is_available: true
  });

  const categories = [
    'Frutas',
    'Verduras',
    'Hortalizas',
    'Aceites',
    'Conservas',
    'Lácteos',
    'Carnes',
    'Cereales',
    'Legumbres',
    'Frutos Secos',
    'Otros'
  ];

  const units = [
    { value: 'kg', label: 'Kilogramo' },
    { value: 'g', label: 'Gramos' },
    { value: 'l', label: 'Litros' },
    { value: 'ml', label: 'Mililitros' },
    { value: 'unidad', label: 'Unidad' },
    { value: 'caja', label: 'Caja' },
    { value: 'bolsa', label: 'Bolsa' },
    { value: 'docena', label: 'Docena' }
  ];

  useEffect(() => {
    fetchProducts();
    fetchFarmers();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('🔄 Obteniendo productos...');
      const response = await apiClient.get<Product[]>('/products?includeInactive=true');
      console.log('✅ Productos recibidos:', response);
      console.log('📊 Cantidad de productos:', response.length);
      setProducts(response);
    } catch (error) {
      console.error('❌ Error al obtener productos:', error);
    } finally {
      console.log('🏁 Finalizando carga de productos');
      setLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      console.log('🔄 Obteniendo agricultores...');
      const response = await apiClient.get<any[]>('/farmers');
      console.log('✅ Agricultores recibidos:', response);
      console.log('📊 Cantidad de agricultores:', response.length);
      setFarmers(response);
    } catch (error) {
      console.error('❌ Error al obtener agricultores:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Construir payload de variantes: usar las existentes y añadir la variante en edición si procede
      const toNumber = (val: any, integer: boolean = false) => {
        if (val === null || val === undefined) return 0;
        const n = Number(val);
        if (!Number.isFinite(n)) return 0;
        return integer ? Math.trunc(n) : n;
      };

      const normalizeVariant = (v: any) => ({
        ...v,
        price: toNumber(v.price),
        stock_quantity: toNumber(v.stock_quantity, true),
        weight: v.weight !== undefined ? toNumber(v.weight) : undefined,
        pieces: v.pieces !== undefined ? toNumber(v.pieces, true) : undefined,
      });

      let variantsPayload = [...variants].map(normalizeVariant);
      const isNewVariantPending = !editingVariant && showVariantForm && variantFormData.name.trim() && variantFormData.price > 0;
      if (isNewVariantPending) {
        variantsPayload.push(normalizeVariant({ ...variantFormData, id: undefined }));
      }

      const payload = { ...formData, variants: variantsPayload } as any;

      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct.id}`, payload);
        alert('Producto actualizado con éxito');
      } else {
        await apiClient.post('/products', payload);
        alert('Producto creado con éxito');
      }
      
      await fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    }
  };

  // Cargar variantes de un producto
  const fetchVariants = async (productId: string) => {
    try {
      const response = await apiClient.get<ProductVariant[]>(`/products/${productId}/variants`);
      setVariants(response);
    } catch (error) {
      console.error('Error al cargar variantes:', error);
      setVariants([]);
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      farmer_id: product.farmer_id,
      category: product.category,
      unit: product.unit,
      main_image_url: product.main_image_url || '',
      is_available: product.is_available,
      stock_quantity: product.stock_quantity,
      status: product.status,
      featured: product.featured
    });
    
    // Cargar variantes del producto
    await fetchVariants(product.id);
    setShowModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await apiClient.delete(`/products/${productId}`);
        alert('Producto eliminado con éxito');
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setVariants([]);
    setShowVariantForm(false);
    setEditingVariant(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      farmer_id: '',
      category: '',
      unit: 'kg',
      main_image_url: '',
      is_available: true,
      stock_quantity: 0,
      status: 'published',
      featured: false
    });
    setVariantFormData({
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      sku: '',
      weight: 0,
      unit: 'kg',
      pieces: 1,
      is_available: true
    });
  };

  // Gestión de variantes
  const handleAddVariant = () => {
    setEditingVariant(null);
    setVariantFormData({
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      sku: '',
      weight: 0,
      unit: formData.unit,
      pieces: 1,
      is_available: true
    });
    setShowVariantForm(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setVariantFormData(variant);
    setShowVariantForm(true);
  };

  const handleSaveVariant = async () => {
    if (!editingProduct) {
      alert('Debes guardar el producto primero antes de añadir variantes');
      return;
    }

    try {
      if (editingVariant && editingVariant.id) {
        // Actualizar variante existente
        await apiClient.put(`/variants/${editingVariant.id}`, variantFormData);
      } else {
        // Crear nueva variante
        await apiClient.post(`/products/${editingProduct.id}/variants`, variantFormData);
      }
      
      // Recargar variantes
      await fetchVariants(editingProduct.id);
      
      // Resetear formulario
      setShowVariantForm(false);
      setEditingVariant(null);
      setVariantFormData({
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        sku: '',
        weight: 0,
        unit: 'kg',
        pieces: 1,
        is_available: true
      });
    } catch (error) {
      console.error('Error al guardar variante:', error);
      alert('Error al guardar la variante');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta variante?')) {
      return;
    }

    try {
      await apiClient.delete(`/variants/${variantId}`);
      
      // Recargar variantes
      if (editingProduct) {
        await fetchVariants(editingProduct.id);
      }
    } catch (error) {
      console.error('Error al eliminar variante:', error);
      alert('Error al eliminar la variante');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      draft: 'Borrador',
      published: 'Publicado',
      archived: 'Archivado'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600">Administra el catálogo de productos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agricultor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.main_image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                        {product.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.farmer_name || 'Agricultor no encontrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{product.price.toFixed(2)}/{product.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                    <div className={`text-xs ${product.stock_quantity < 10 ? 'text-red-500' : 'text-green-500'}`}>
                      {product.stock_quantity < 10 ? 'Stock bajo' : 'Stock OK'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.status)}
                    {!product.is_available && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          No disponible
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Grid compacto de 2 columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna izquierda */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Producto</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="">Seleccionar</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Unidad</label>
                      <select
                        required
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        {units.map(unit => (
                          <option key={unit.value} value={unit.value}>{unit.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Agricultor</label>
                    <select
                      required
                      value={formData.farmer_id}
                      onChange={(e) => setFormData({...formData, farmer_id: e.target.value})}
                      className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                    >
                      <option value="">Seleccionar</option>
                      {farmers.map(farmer => (
                        <option key={farmer.id} value={farmer.id}>
                          {farmer.first_name} {farmer.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Precio (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                        className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                        className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="published">Publicado</option>
                        <option value="draft">Borrador</option>
                        <option value="archived">Archivado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Describe el producto..."
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_available"
                        checked={formData.is_available}
                        onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="is_available" className="ml-2 block text-xs text-gray-900">
                        Disponible
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="featured" className="ml-2 block text-xs text-gray-900">
                        ⭐ Destacado
                      </label>
                    </div>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-3">
                  {/* Componente de subida de imagen */}
                  <ImageUpload
                    currentImageUrl={formData.main_image_url}
                    onImageUploaded={(url) => setFormData({...formData, main_image_url: url})}
                    label="Imagen Principal"
                  />

                  {/* Sección de variantes */}
                  {editingProduct && (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">Variantes del Producto</h4>
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                        >
                          + Añadir Variante
                        </button>
                      </div>

                      {/* Lista de variantes */}
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {variants.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">No hay variantes. Añade una para ofrecer diferentes presentaciones.</p>
                        ) : (
                          variants.map((variant) => (
                            <div key={variant.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{variant.name}</p>
                                <p className="text-gray-600">
                                  €{variant.price.toFixed(2)} | Stock: {variant.stock_quantity}
                                  {variant.weight && ` | ${variant.weight}${variant.unit}`}
                                </p>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditVariant(variant)}
                                  className="text-blue-600 hover:text-blue-800 px-1"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  onClick={() => variant.id && handleDeleteVariant(variant.id)}
                                  className="text-red-600 hover:text-red-800 px-1"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {!editingProduct && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        💡 <strong>Tip:</strong> Guarda el producto primero para poder añadir variantes (diferentes tamaños, presentaciones, etc.)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Formulario de variante (modal interno) */}
              {showVariantForm && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {editingVariant ? 'Editar Variante' : 'Nueva Variante'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={variantFormData.name}
                        onChange={(e) => setVariantFormData({...variantFormData, name: e.target.value})}
                        className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="ej: Caja 5kg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                      <input
                        type="text"
                        value={variantFormData.sku}
                        onChange={(e) => setVariantFormData({...variantFormData, sku: e.target.value})}
                        className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="opcional"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Precio (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={variantFormData.price}
                        onChange={(e) => setVariantFormData({...variantFormData, price: parseFloat(e.target.value)})}
                        className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        value={variantFormData.stock_quantity}
                        onChange={(e) => setVariantFormData({...variantFormData, stock_quantity: parseInt(e.target.value)})}
                        className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Peso/Cantidad</label>
                      <input
                        type="number"
                        step="0.01"
                        value={variantFormData.weight}
                        onChange={(e) => setVariantFormData({...variantFormData, weight: parseFloat(e.target.value)})}
                        className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Unidades/Piezas</label>
                      <input
                        type="number"
                        value={variantFormData.pieces}
                        onChange={(e) => setVariantFormData({...variantFormData, pieces: parseInt(e.target.value)})}
                        className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowVariantForm(false)}
                      className="text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveVariant}
                      className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded"
                    >
                      Guardar Variante
                    </button>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-1.5 px-4 rounded text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-1.5 px-4 rounded text-sm"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
