import { mapApplicationToRecord, mapFarmerToRecord } from '@/lib/farmerRecords';
import type { FarmerApplicationRow, FarmerRecord, FarmerRow } from '@/types/farmer';

const adminRequest = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`/api/admin${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Error en la solicitud al panel de administración');
  }

  return data as T;
};

const sortByNewest = (records: FarmerRecord[]) =>
  [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const adminFarmerService = {
  /**
   * Une solicitudes y fichas en una sola lista. Una solicitud aprobada ya tiene
   * su ficha en `farmers`, así que se descarta para no duplicar filas.
   */
  async listRecords(): Promise<FarmerRecord[]> {
    const [applications, farmers] = await Promise.all([
      adminRequest<FarmerApplicationRow[]>('/farmer-applications'),
      adminRequest<FarmerRow[]>('/farmers')
    ]);

    const farmerRecords = (farmers || []).map(mapFarmerToRecord);
    const knownEmails = new Set(farmerRecords.map((record) => record.email.toLowerCase()));

    const applicationRecords = (applications || [])
      .filter((application) => application.status !== 'approved')
      .map(mapApplicationToRecord)
      .filter((record) => !knownEmails.has(record.email.toLowerCase()));

    return sortByNewest([...farmerRecords, ...applicationRecords]);
  },

  async approve(record: FarmerRecord): Promise<void> {
    if (record.source === 'application') {
      await adminRequest(`/farmer-applications/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'approve' })
      });
      return;
    }

    await adminRequest(`/farmers/${record.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' })
    });
  },

  async reject(record: FarmerRecord, reason?: string): Promise<void> {
    if (record.source === 'application') {
      await adminRequest(`/farmer-applications/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'reject', admin_notes: reason })
      });
      return;
    }

    // La tabla `farmers` no almacena motivo de rechazo, solo el cambio de estado.
    await adminRequest(`/farmers/${record.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected' })
    });
  }
};
