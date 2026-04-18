import { AdminDashboardStats } from '@/types/admin';

const parseJsonOrThrow = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Error en la solicitud');
  }
  return data;
};

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await fetch('/api/admin/dashboard', {
      credentials: 'include'
    });
    const data = await parseJsonOrThrow(response);
    return data.stats as AdminDashboardStats;
  }
};
