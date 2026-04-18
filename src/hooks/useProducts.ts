'use client';
import { useState, useEffect } from 'react';
import { productApi, ApiProduct } from '@/lib/api';

// Hook para obtener todos los productos
export function useProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.getAll();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar productos');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error, refetch: () => setLoading(true) };
}

// Hook para obtener un producto específico
export function useProduct(id: string) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productApi.getById(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar producto');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}

// Hook para productos por categoría
export function useProductsByCategory(category: string | null) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = category && category !== 'all' 
          ? await productApi.getByCategory(category)
          : await productApi.getAll();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar productos');
        console.error('Error fetching products by category:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return { products, loading, error };
}

// Hook para buscar productos
export function useProductSearch(query: string) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    const searchProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.search(query);
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Error en la búsqueda');
        console.error('Error searching products:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { products, loading, error };
}