'use client';
import { useState, useEffect } from 'react';
import { farmerApi, ApiFarmer } from '@/lib/api';

// Hook para obtener todos los agricultores
export function useFarmers() {
  const [farmers, setFarmers] = useState<ApiFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        const data = await farmerApi.getAll();
        setFarmers(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar agricultores');
        console.error('Error fetching farmers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  return { farmers, loading, error, refetch: () => setLoading(true) };
}

// Hook para obtener un agricultor específico
export function useFarmer(id: string) {
  const [farmer, setFarmer] = useState<ApiFarmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchFarmer = async () => {
      try {
        setLoading(true);
        const data = await farmerApi.getById(id);
        setFarmer(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar agricultor');
        console.error('Error fetching farmer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [id]);

  return { farmer, loading, error };
}

// Hook para buscar agricultores
export function useFarmerSearch(query: string) {
  const [farmers, setFarmers] = useState<ApiFarmer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setFarmers([]);
      return;
    }

    const searchFarmers = async () => {
      try {
        setLoading(true);
        const data = await farmerApi.search(query);
        setFarmers(data);
        setError(null);
      } catch (err) {
        setError('Error en la búsqueda');
        console.error('Error searching farmers:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchFarmers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { farmers, loading, error };
}

